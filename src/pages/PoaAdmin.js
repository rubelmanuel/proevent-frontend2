import React, { useState, useEffect } from "react";
import "./../css/Dashboard.css";
import { FiCheckCircle, FiXCircle, FiDollarSign, FiCalendar } from "react-icons/fi";

const API = "http://localhost:8080";

export default function PoaAdmin({ usuario }) {
  const [poas, setPoas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [montoTotal, setMontoTotal] = useState("");

  const [modalRechazo, setModalRechazo] = useState(false);
  const [movRechazoId, setMovRechazoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  useEffect(() => {
    cargarPoaData();
  }, []);

  const cargarPoaData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/poa`);
      const data = await res.json();
      setPoas(data.poas || []);
      setMovimientos(data.movimientos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPoa = async (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin || !montoTotal) return;
    try {
      const res = await fetch(`${API}/poa`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-usuario-id": usuario?.id_usuario || "" },
        body: JSON.stringify({ fecha_inicio: fechaInicio, fecha_fin: fechaFin, monto_total: montoTotal })
      });
      if (res.ok) {
        alert("Presupuesto POA anual guardado con éxito.");
        setFechaInicio(""); setFechaFin(""); setMontoTotal("");
        cargarPoaData();
      } else {
        alert("Error al crear POA");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const handleCambiarEstado = async (id, estado, motivo = null) => {
    try {
      const res = await fetch(`${API}/poa/movimiento/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-usuario-id": usuario?.id_usuario || "" },
        body: JSON.stringify({ estado, motivo_rechazo: motivo })
      });
      if (res.ok) {
        cargarPoaData();
        if (estado === "Rechazado") {
          setModalRechazo(false);
          setMovRechazoId(null);
          setMotivoRechazo("");
        }
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const poaActual = poas.length > 0 ? poas[0] : null;

  if (usuario?.rol !== "Administrador" && usuario?.rol !== "Administrador V-A-F") {
    return <div style={{ padding: "2rem" }}>No tienes permisos para acceder al módulo POA.</div>;
  }

  return (
    <div className="tab-content fade-in">
      <div className="tab-header">
        <div>
          <h2>Plan Operativo Anual (POA)</h2>
          <p>Administración de fondos y aprobaciones de presupuesto para eventos.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className="av-card" style={{ flex: 1 }}>
          <h3>Aperturar Año Fiscal POA</h3>
          <form onSubmit={handleCrearPoa} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Fecha de Inicio</label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Fecha de Término</label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Monto Aprobado (DOP)</label>
              <input type="number" step="0.01" value={montoTotal} onChange={e => setMontoTotal(e.target.value)} required placeholder="Ej. 1500000.00" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>Guardar Presupuesto POA</button>
          </form>
        </div>

        <div className="av-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
          {poaActual ? (
            <div style={{ textAlign: 'center' }}>
              <FiDollarSign size={40} color="#16a34a" />
              <h3 style={{ margin: "10px 0", color: "#334155" }}>Resumen del POA Activo</h3>
              <p style={{ color: "#64748b" }}>Del {poaActual.fecha_inicio.substring(0, 10)} al {poaActual.fecha_fin.substring(0, 10)}</p>
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontSize: "14px", color: "#64748b" }}>Monto Total Original</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#334155" }}>RD$ {Number(poaActual.monto_total).toLocaleString("en-US", {minimumFractionDigits: 2})}</div>
              </div>
              <div style={{ marginTop: "15px", background: "#dcfce7", padding: "15px", borderRadius: "8px" }}>
                <div style={{ fontSize: "14px", color: "#16a34a", fontWeight: "bold" }}>Fondo Disponible Restante</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#16a34a" }}>RD$ {Number(poaActual.monto_disponible).toLocaleString("en-US", {minimumFractionDigits: 2})}</div>
              </div>
            </div>
          ) : (
             <div style={{ color: "#64748b", textAlign: "center" }}>
               <FiCalendar size={40} style={{ opacity: 0.5, marginBottom: "10px" }} />
               <p>No hay un año fiscal registrado aún.</p>
             </div>
          )}
        </div>
      </div>

      <div className="av-card" style={{ marginTop: '20px' }}>
        <h3>Historial de Movimientos y Solicitudes de Eventos</h3>
        <table className="requests-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', background: '#f1f5f9' }}>
              <th style={{ padding: '12px' }}>FECHA</th>
              <th style={{ padding: '12px' }}>EVENTO</th>
              <th style={{ padding: '12px' }}>SOLICITANTE</th>
              <th style={{ padding: '12px' }}>SOLICITUD ORIG.</th>
              <th style={{ padding: '12px' }}>DESCUENTO (DOP)</th>
              <th style={{ padding: '12px' }}>ESTADO</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(mov => (
              <tr key={mov.id_movimiento} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{mov.fecha_movimiento.substring(0, 10)}</td>
                <td style={{ padding: '12px' }}><strong>#EVT-{mov.id_evento}</strong><br/><span style={{fontSize: "12px", color: "#64748b"}}>{mov.nombre_evento}</span></td>
                <td style={{ padding: '12px' }}>{mov.solicitante || "N/D"}</td>
                <td style={{ padding: '12px' }}>{Number(mov.monto_solicitado_original).toLocaleString()} {mov.moneda_original} <br/><span style={{fontSize: "10px", color: "#94a3b8"}}>Tasa: {mov.tasa_cambio}</span></td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>- RD$ {Number(mov.monto_descontado_dop).toLocaleString("en-US", {minimumFractionDigits: 2})}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                    background: mov.estado === 'Aprobado' ? '#dcfce7' : mov.estado === 'Rechazado' ? '#fee2e2' : '#fef3c7',
                    color: mov.estado === 'Aprobado' ? '#16a34a' : mov.estado === 'Rechazado' ? '#dc2626' : '#d97706'
                  }}>
                    {mov.estado}
                  </span>
                  {mov.estado === 'Rechazado' && mov.motivo_rechazo && (
                    <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', maxWidth: '150px' }}>Motivo: {mov.motivo_rechazo}</div>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {mov.estado === 'Pendiente' && (
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button onClick={() => handleCambiarEstado(mov.id_movimiento, 'Aprobado')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} title="Aprobar el descuento del POA">
                        <FiCheckCircle />
                      </button>
                      <button onClick={() => { setMovRechazoId(mov.id_movimiento); setModalRechazo(true); }} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} title="Rechazar el descuento (Restituye el saldo)">
                        <FiXCircle />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No hay movimientos en el POA registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalRechazo && (
        <div className="modal-overlay" onClick={() => setModalRechazo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header"><h2>Motivo de Rechazo</h2></div>
            <div className="modal-body">
              <p>Por favor, indica la razón por la cual se rechaza este presupuesto (el monto descontado de la solicitud se devolverá al balance disponible del año fiscal en este momento).</p>
              <textarea 
                value={motivoRechazo} 
                onChange={e => setMotivoRechazo(e.target.value)} 
                rows="4" 
                style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", resize: "none" }}
                placeholder="Razón del rechazo..."
              ></textarea>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" style={{ background: "#dc2626", borderColor: "#dc2626" }} onClick={() => handleCambiarEstado(movRechazoId, 'Rechazado', motivoRechazo)} disabled={!motivoRechazo.trim()}>Confirmar Rechazo</button>
              <button className="close-btn" onClick={() => setModalRechazo(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
