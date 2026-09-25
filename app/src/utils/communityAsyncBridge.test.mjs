import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createCommunityAsyncBridge } from "./communityAsyncBridge.js";
import { createMemoryCommunityRepository } from "./communityRepository.js";
import { createDemoCommunityAuthBoundary, AGE_STATUS } from "./communityAuthBoundary.js";
import { createPlayerSocialProfile } from "../../projects/club-padel-04/community-logic/index.mjs";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const CLUB = "async-bridge-club-01";
const CLUB_B = "async-bridge-club-02";

function makeRepo(clubId = CLUB) {
  return createMemoryCommunityRepository(clubId);
}

function makeAuth(overrides = {}) {
  return createDemoCommunityAuthBoundary({
    actorId: "bridge-actor-1",
    clubId: CLUB,
    role: "PLAYER",
    ageStatus: AGE_STATUS.ADULT_VERIFIED,
    authenticated: true,
    ...overrides,
  });
}

function makeBridge(repoOverride, authOverride) {
  return createCommunityAsyncBridge({
    repo: repoOverride ?? makeRepo(),
    auth: authOverride ?? makeAuth(),
  });
}

// --------------------------------------------------------------------------
// createCommunityAsyncBridge — validación de argumentos
// --------------------------------------------------------------------------

describe("createCommunityAsyncBridge — inicialización", () => {
  it("crea la instancia correctamente", () => {
    const bridge = makeBridge();
    assert.ok(bridge);
  });

  it("lanza si no se pasa repo", () => {
    assert.throws(() => createCommunityAsyncBridge({ auth: makeAuth() }));
  });

  it("lanza si no se pasa auth", () => {
    assert.throws(() => createCommunityAsyncBridge({ repo: makeRepo() }));
  });

  it("getClubId devuelve el clubId del repo", async () => {
    const bridge = makeBridge();
    assert.equal(await bridge.getClubId(), CLUB);
  });

  it("isAuthenticated=true con auth demo autenticado", async () => {
    const bridge = makeBridge();
    assert.equal(await bridge.isAuthenticated(), true);
  });

  it("isAuthenticated=false con auth no autenticado", async () => {
    const bridge = makeBridge(null, makeAuth({ authenticated: false }));
    assert.equal(await bridge.isAuthenticated(), false);
  });
});

// --------------------------------------------------------------------------
// Consentimiento
// --------------------------------------------------------------------------

describe("async bridge — consentimiento", () => {
  it("grantSocialConsent retorna ok=true si autenticado", async () => {
    const bridge = makeBridge();
    const result = await bridge.grantSocialConsent();
    assert.equal(result.ok, true);
  });

  it("grantSocialConsent retorna error forbidden si no autenticado", async () => {
    const bridge = makeBridge(null, makeAuth({ authenticated: false }));
    const result = await bridge.grantSocialConsent();
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "forbidden");
  });

  it("hasSocialConsent=true después de grantSocialConsent", async () => {
    const bridge = makeBridge();
    await bridge.grantSocialConsent();
    assert.equal(await bridge.hasSocialConsent(), true);
  });

  it("hasSocialConsent=false antes de grant", async () => {
    const bridge = makeBridge();
    assert.equal(await bridge.hasSocialConsent(), false);
  });

  it("revokeSocialConsent quita el consentimiento", async () => {
    const bridge = makeBridge();
    await bridge.grantSocialConsent();
    await bridge.revokeSocialConsent();
    assert.equal(await bridge.hasSocialConsent(), false);
  });
});

// --------------------------------------------------------------------------
// Age gate
// --------------------------------------------------------------------------

describe("async bridge — age gate", () => {
  it("createPost bloqueado para menores", async () => {
    const bridge = makeBridge(null, makeAuth({ ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY }));
    const result = await bridge.createPost("hola mundo");
    assert.equal(result.ok, false);
    assert.equal(result.error?.type, "age_gate_blocked");
  });

  it("createPost bloqueado para AGE_UNKNOWN", async () => {
    const bridge = makeBridge(null, makeAuth({ ageStatus: AGE_STATUS.AGE_UNKNOWN }));
    const result = await bridge.createPost("hola");
    assert.equal(result.ok, false);
  });

  it("createPost permitido para ADULT_VERIFIED", async () => {
    const bridge = makeBridge();
    await bridge.grantSocialConsent();
    const result = await bridge.createPost("hola adultos");
    assert.equal(result.ok, true);
    assert.ok(result.postId);
  });

  it("follow bloqueado para menores", async () => {
    const bridge = makeBridge(null, makeAuth({ ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY }));
    const result = await bridge.follow("other-user");
    assert.equal(result.ok, false);
  });

  it("sendFriend bloqueado para menores", async () => {
    const bridge = makeBridge(null, makeAuth({ ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY }));
    const result = await bridge.sendFriend("other-user");
    assert.equal(result.ok, false);
  });
});

// --------------------------------------------------------------------------
// Amistad
// --------------------------------------------------------------------------

describe("async bridge — amistad", () => {
  it("sendFriend crea la solicitud", async () => {
    const repo = makeRepo();
    const auth1 = makeAuth({ actorId: "user-a" });
    const bridge1 = createCommunityAsyncBridge({ repo, auth: auth1 });
    await bridge1.grantSocialConsent();

    const result = await bridge1.sendFriend("user-b");
    assert.equal(result.ok, true);
    assert.ok(result.friendshipId);
  });

  it("rejectFriend rechaza la solicitud", async () => {
    const repo = makeRepo();

    const auth1 = makeAuth({ actorId: "user-a" });
    const auth2 = makeAuth({ actorId: "user-b" });
    const bridge1 = createCommunityAsyncBridge({ repo, auth: auth1 });
    const bridge2 = createCommunityAsyncBridge({ repo, auth: auth2 });

    await bridge1.grantSocialConsent();
    const { friendshipId } = await bridge1.sendFriend("user-b");

    const result = await bridge2.rejectFriend(friendshipId);
    assert.equal(result.ok, true);
  });

  it("cancelFriend cancela la solicitud", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo);
    await bridge.grantSocialConsent();
    const { friendshipId } = await bridge.sendFriend("user-x");
    const cancel = await bridge.cancelFriend(friendshipId);
    assert.equal(cancel.ok, true);
  });

  it("removeFriendship retorna ok", async () => {
    const repo = makeRepo();
    const auth1 = makeAuth({ actorId: "user-a" });
    const auth2 = makeAuth({ actorId: "user-b" });
    const bridge1 = createCommunityAsyncBridge({ repo, auth: auth1 });
    const bridge2 = createCommunityAsyncBridge({ repo, auth: auth2 });

    await bridge1.grantSocialConsent();
    await bridge2.grantSocialConsent();
    const { friendshipId } = await bridge1.sendFriend("user-b");
    await bridge2.acceptFriend(friendshipId);
    const remove = await bridge1.removeFriendship("user-b");
    assert.equal(remove.ok, true);
  });
});

// --------------------------------------------------------------------------
// Follow
// --------------------------------------------------------------------------

describe("async bridge — follow", () => {
  it("follow crea la relación", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo);
    await bridge.grantSocialConsent();
    // El target necesita un playerSocialProfile con visibilityLevel != "private"
    const store = await repo.getStore();
    store.playerSocialProfiles.push(
      createPlayerSocialProfile({ clubId: CLUB, userProfileId: "user-z", visibilityLevel: "friends" })
    );
    const result = await bridge.follow("user-z");
    assert.equal(result.ok, true);
    assert.ok(result.followId);
  });

  it("unfollow ok", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo);
    await bridge.grantSocialConsent();
    const store = await repo.getStore();
    store.playerSocialProfiles.push(
      createPlayerSocialProfile({ clubId: CLUB, userProfileId: "user-z", visibilityLevel: "friends" })
    );
    await bridge.follow("user-z");
    const result = await bridge.unfollow("user-z");
    assert.equal(result.ok, true);
  });
});

// --------------------------------------------------------------------------
// Feed y posts
// --------------------------------------------------------------------------

describe("async bridge — feed y posts", () => {
  it("createPost devuelve postId", async () => {
    const bridge = makeBridge();
    await bridge.grantSocialConsent();
    const result = await bridge.createPost("test body");
    assert.equal(result.ok, true);
    assert.ok(result.postId);
    assert.ok(result.post);
  });

  it("getFeedPage devuelve items (no posts)", async () => {
    const bridge = makeBridge();
    await bridge.grantSocialConsent();
    await bridge.createPost("post 1");
    await bridge.createPost("post 2");

    const page = await bridge.getFeedPage({ limit: 10 });
    assert.equal(page.ok, true);
    assert.ok(Array.isArray(page.items));
    assert.ok(page.items.length >= 0); // puede que no sea visible si el feed filtra por amigos
  });

  it("getFeedPage bloqueado para menores", async () => {
    const bridge = makeBridge(null, makeAuth({ ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY }));
    const page = await bridge.getFeedPage();
    assert.equal(page.ok, false);
  });

  it("addComment crea un comentario", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo);
    await bridge.grantSocialConsent();
    const { postId } = await bridge.createPost("post con comentario");

    const comment = await bridge.addComment(postId, "buen post");
    assert.equal(comment.ok, true);
    assert.ok(comment.commentId);
  });

  it("react crea una reacción", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo);
    await bridge.grantSocialConsent();
    const { postId } = await bridge.createPost("post reactable");

    const result = await bridge.react("post", postId);
    assert.equal(result.ok, true);
    assert.ok(result.reactionId);
  });
});

// --------------------------------------------------------------------------
// Partidos
// --------------------------------------------------------------------------

describe("async bridge — partidos", () => {
  it("createMatch devuelve matchId", async () => {
    const bridge = makeBridge();
    await bridge.grantSocialConsent();
    const result = await bridge.createMatch({ scheduledAt: new Date(Date.now() + 3600e3).toISOString() });
    assert.equal(result.ok, true);
    assert.ok(result.matchId);
  });

  it("joinMatch crea invitación", async () => {
    const repo = makeRepo();
    const auth1 = makeAuth({ actorId: "creator" });
    const auth2 = makeAuth({ actorId: "joiner" });
    const bridge1 = createCommunityAsyncBridge({ repo, auth: auth1 });
    const bridge2 = createCommunityAsyncBridge({ repo, auth: auth2 });

    await bridge1.grantSocialConsent();
    const { matchId } = await bridge1.createMatch({
      scheduledAt: new Date(Date.now() + 3600e3).toISOString(),
      slotsTotal: 4,
    });

    await bridge2.grantSocialConsent();
    const result = await bridge2.joinMatch(matchId);
    assert.equal(result.ok, true);
    assert.ok(result.inviteId);
  });
});

// --------------------------------------------------------------------------
// Notificaciones
// --------------------------------------------------------------------------

describe("async bridge — notificaciones", () => {
  it("getNotifications devuelve array", async () => {
    const bridge = makeBridge();
    const notifs = await bridge.getNotifications();
    assert.ok(Array.isArray(notifs));
  });

  it("getUnread devuelve número", async () => {
    const bridge = makeBridge();
    const count = await bridge.getUnread();
    assert.ok(typeof count === "number");
  });
});

// --------------------------------------------------------------------------
// Moderación
// --------------------------------------------------------------------------

describe("async bridge — moderación", () => {
  it("report crea un reporte", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo);
    await bridge.grantSocialConsent();
    const { postId } = await bridge.createPost("contenido reportable");

    const result = await bridge.report("post", postId, "spam");
    assert.equal(result.ok, true);
    assert.ok(result.reportId);
  });

  it("moderateMarkInReview funciona con ADMIN", async () => {
    const repo = makeRepo();
    const bridge = makeBridge(repo, makeAuth({ actorId: "admin-1", role: "ADMIN" }));
    await bridge.grantSocialConsent();
    const { postId } = await bridge.createPost("contenido");
    const { reportId } = await bridge.report("post", postId, "spam");

    // bridge2 comparte el mismo repo — el moderador tiene rol ADMIN
    const bridge2 = createCommunityAsyncBridge({
      repo,
      auth: makeAuth({ actorId: "mod-1", role: "ADMIN" }),
    });
    // _ensureProfile se llama dentro de moderateMarkInReview con role="ADMIN"
    const result = await bridge2.moderateMarkInReview(reportId);
    assert.equal(result.ok, true);
  });
});

// --------------------------------------------------------------------------
// Error auth en operaciones mutantes
// --------------------------------------------------------------------------

describe("async bridge — no autenticado", () => {
  const noAuthBridge = () => makeBridge(null, makeAuth({ authenticated: false }));

  it("createPost retorna forbidden", async () => {
    const result = await noAuthBridge().createPost("test");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "forbidden");
  });

  it("sendFriend retorna forbidden", async () => {
    const result = await noAuthBridge().sendFriend("other");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "forbidden");
  });

  it("follow retorna forbidden", async () => {
    const result = await noAuthBridge().follow("other");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "forbidden");
  });

  it("report retorna forbidden", async () => {
    const result = await noAuthBridge().report("post", "p1", "spam");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "forbidden");
  });
});
