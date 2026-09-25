// Safe Command Policy — ADV-05
// Classifies every terminal operation into one of four safety tiers.

export const COMMAND_TIER = Object.freeze({
  SAFE_AUTO:        'SAFE_AUTO',
  SAFE_WITH_SCOPE:  'SAFE_WITH_SCOPE',
  HUMAN_REQUIRED:   'HUMAN_REQUIRED',
  BLOCKED:          'BLOCKED',
});

export const COMMAND_CATEGORY = Object.freeze({
  READ:     'READ',
  SEARCH:   'SEARCH',
  TEST:     'TEST',
  LINT:     'LINT',
  BUILD:    'BUILD',
  GIT_READ: 'GIT_READ',
  GIT_WRITE:'GIT_WRITE',
  SECRET:   'SECRET',
  DEPLOY:   'DEPLOY',
  BILLING:  'BILLING',
  DESTRUCT: 'DESTRUCT',
});

const POLICY_TABLE = Object.freeze([
  // READ
  { pattern: /^(pwd|ls|cat|head|tail|find|rg|grep|sed -n|awk|wc|tree)/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.READ },
  // SEARCH
  { pattern: /^(rg |grep |find \.)/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.SEARCH },
  // TEST
  { pattern: /^node --test/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.TEST },
  { pattern: /^npm (run )?(test|lint)/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.TEST },
  // LINT
  { pattern: /^npx eslint/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.LINT },
  // BUILD
  { pattern: /^npm run build/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.BUILD },
  { pattern: /^npx vite build/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.BUILD },
  // GIT READ
  { pattern: /^git (status|diff|log|branch|rev-parse|show|stash list|remote -v)/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.GIT_READ },
  { pattern: /^git fetch --dry-run/, tier: COMMAND_TIER.SAFE_AUTO, category: COMMAND_CATEGORY.GIT_READ },
  // GIT WRITE (scope-safe)
  { pattern: /^git add /, tier: COMMAND_TIER.SAFE_WITH_SCOPE, category: COMMAND_CATEGORY.GIT_WRITE },
  { pattern: /^git commit/, tier: COMMAND_TIER.SAFE_WITH_SCOPE, category: COMMAND_CATEGORY.GIT_WRITE },
  { pattern: /^git push -u origin feature\/factory-/, tier: COMMAND_TIER.SAFE_WITH_SCOPE, category: COMMAND_CATEGORY.GIT_WRITE },
  { pattern: /^git checkout -b feature\/factory-/, tier: COMMAND_TIER.SAFE_WITH_SCOPE, category: COMMAND_CATEGORY.GIT_WRITE },
  { pattern: /^gh pr (create|view|edit)/, tier: COMMAND_TIER.SAFE_WITH_SCOPE, category: COMMAND_CATEGORY.GIT_WRITE },
  { pattern: /^git fetch origin/, tier: COMMAND_TIER.SAFE_WITH_SCOPE, category: COMMAND_CATEGORY.GIT_WRITE },
  // HUMAN_REQUIRED
  { pattern: /stripe|oauth|mfa|billing|payment|whatsapp|domain|dns/i, tier: COMMAND_TIER.HUMAN_REQUIRED, category: COMMAND_CATEGORY.BILLING },
  { pattern: /git push.*--force|git push.*-f\b/, tier: COMMAND_TIER.BLOCKED, category: COMMAND_CATEGORY.DESTRUCT },
  // BLOCKED
  { pattern: /git reset --hard|git clean -[fdx]|git rebase/, tier: COMMAND_TIER.BLOCKED, category: COMMAND_CATEGORY.DESTRUCT },
  { pattern: /rm -rf|drop table|truncate/i, tier: COMMAND_TIER.BLOCKED, category: COMMAND_CATEGORY.DESTRUCT },
  { pattern: /process\.env\.(SECRET|KEY|TOKEN|PASSWORD|CREDENTIAL)/i, tier: COMMAND_TIER.BLOCKED, category: COMMAND_CATEGORY.SECRET },
]);

export function classifyCommand(command = '') {
  if (!command || typeof command !== 'string') {
    return { valid: false, error: 'command required', tier: COMMAND_TIER.BLOCKED };
  }
  const cmd = command.trim();
  for (const rule of POLICY_TABLE) {
    if (rule.pattern.test(cmd)) {
      return {
        valid:    true,
        command:  cmd,
        tier:     rule.tier,
        category: rule.category,
        canAutoRun: rule.tier === COMMAND_TIER.SAFE_AUTO,
        requiresScope: rule.tier === COMMAND_TIER.SAFE_WITH_SCOPE,
        requiresHuman: rule.tier === COMMAND_TIER.HUMAN_REQUIRED,
        isBlocked: rule.tier === COMMAND_TIER.BLOCKED,
        isReal:   false,
      };
    }
  }
  // unknown → HUMAN_REQUIRED by default (safe)
  return {
    valid: true, command: cmd,
    tier: COMMAND_TIER.HUMAN_REQUIRED,
    category: COMMAND_CATEGORY.READ,
    canAutoRun: false, requiresScope: false,
    requiresHuman: true, isBlocked: false,
    isReal: false,
  };
}

export function filterSafeCommands(commands = []) {
  return commands.map(c => classifyCommand(c)).filter(r => r.canAutoRun);
}

export const SAFE_COMMAND_POLICY_VERSION = '1.0.0';
