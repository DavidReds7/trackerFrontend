import { useEffect, useState } from 'react';
import { fetchAdminOverview } from '@/api/adminService';

const AdminStats = () => {
  const [stats, setStats] = useState({ enviados: 0, activos: 0, alertas: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchAdminOverview()
      .then((data) => {
        if (isMounted) {
          setStats(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message ?? 'No se pudo cargar la información');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <p style={{ color: 'crimson' }}>{error}</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
      <div>
        <strong>Paquetes enviados</strong>
        <p>{stats.enviados}</p>
      </div>
      <div>
        <strong>Rastreos activos</strong>
        <p>{stats.activos}</p>
      </div>
      <div>
        <strong>Alertas</strong>
        <p>{stats.alertas}</p>
      </div>
    </div>
  );
};

export default AdminStats;
