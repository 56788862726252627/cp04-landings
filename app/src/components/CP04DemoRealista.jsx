import React from "react";
import { cp04DemoData } from "../data/cp04DemoData";
import "../styles/cp04-demo-realista.css";

export default function CP04DemoRealista() {
  const data = cp04DemoData;
  const topJugadores = [...data.jugadores].sort((a, b) => a.ranking - b.ranking).slice(0, 5);

  return (
    <section className="cp04-demo-realista" id="demo-realista-cp04">
      <div className="cp04-demo-bg" />

      <div className="cp04-demo-shell">
        <div className="cp04-demo-header">
          <div>
            <p className="cp04-demo-eyebrow">Demo realista · Club Pádel 04</p>
            <h2>Un club en funcionamiento, no una maqueta vacía</h2>
            <p>
              Datos ficticios preparados para enseñar reservas, jugadores, ranking, staff,
              administración, torneos e incidencias como si el club ya estuviera operando.
            </p>
          </div>

          <div className="cp04-demo-club-card">
            <span>Club demo</span>
            <strong>{data.club.nombre}</strong>
            <small>{data.club.ubicacion}</small>
            <div className="cp04-demo-club-metrics">
              <div><b>{data.club.pistas}</b><small>Pistas</small></div>
              <div><b>{data.club.horario}</b><small>Horario</small></div>
            </div>
          </div>
        </div>

        <div className="cp04-demo-grid">
          <article className="cp04-demo-panel cp04-demo-panel-large">
            <div className="cp04-demo-panel-title">
              <span>Reservas demo</span>
              <b>{data.reservas.length} reservas</b>
            </div>
            <div className="cp04-demo-reservas">
              {data.reservas.map((reserva, index) => (
                <div className="cp04-demo-reserva" key={`${reserva.jugador}-${index}`}>
                  <div className="cp04-demo-date">
                    <strong>{reserva.dia}</strong>
                    <span>{reserva.hora}</span>
                  </div>
                  <div>
                    <h3>{reserva.jugador}</h3>
                    <p>{reserva.pista} · {reserva.modalidad}</p>
                  </div>
                  <span className={`cp04-demo-status ${reserva.estado.includes("Pendiente") ? "pending" : "ok"}`}>
                    {reserva.estado}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="cp04-demo-panel">
            <div className="cp04-demo-panel-title">
              <span>Ranking</span>
              <b>Top 5</b>
            </div>
            <div className="cp04-demo-ranking">
              {topJugadores.map((jugador) => (
                <div className="cp04-demo-rank" key={jugador.nombre}>
                  <span>#{jugador.ranking}</span>
                  <div>
                    <strong>{jugador.nombre}</strong>
                    <small>{jugador.nivel}</small>
                  </div>
                  <b>{jugador.puntos}</b>
                </div>
              ))}
            </div>
          </article>

          <article className="cp04-demo-panel">
            <div className="cp04-demo-panel-title">
              <span>Staff / recepción</span>
              <b>{data.staff.nombre}</b>
            </div>
            <ul className="cp04-demo-list">
              {data.staff.funciones.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="cp04-demo-panel">
            <div className="cp04-demo-panel-title">
              <span>Administrador</span>
              <b>{data.administrador.nombre}</b>
            </div>
            <ul className="cp04-demo-list">
              {data.administrador.funciones.slice(0, 5).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="cp04-demo-panel cp04-demo-torneo">
            <div className="cp04-demo-panel-title">
              <span>Torneo activo</span>
              <b>{data.torneos[0].estado}</b>
            </div>
            <h3>{data.torneos[0].nombre}</h3>
            <p>{data.torneos[0].formato}</p>
            <div className="cp04-demo-tags">
              {data.torneos[0].categorias.map((cat) => (
                <span key={cat}>{cat}</span>
              ))}
            </div>
          </article>

          <article className="cp04-demo-panel cp04-demo-incidencias">
            <div className="cp04-demo-panel-title">
              <span>Incidencias demo</span>
              <b>{data.incidencias.length} abiertas</b>
            </div>
            <ul className="cp04-demo-list">
              {data.incidencias.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="cp04-demo-proof">
          <div>
            <span>Prueba de funcionamiento</span>
            <strong>Reserva enviada desde app → Make ejecutado → correo recibido</strong>
          </div>
          <div className="cp04-demo-proof-steps">
            <b>App ✅</b>
            <b>Make ✅</b>
            <b>Correo ✅</b>
            <b>Piloto controlado ✅</b>
          </div>
        </div>
      </div>
    </section>
  );
}
