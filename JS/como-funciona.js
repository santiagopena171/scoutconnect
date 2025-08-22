// como-funciona.js
// Genera dinámicamente el contenido de la página "Cómo funciona ScoutConnect"

document.addEventListener('DOMContentLoaded', function () {
  // Datos para futbolistas
  const futbolistasSteps = [
    {
  img: 'imagenes/imagen4.png',
      title: 'Creá tu perfil',
      desc: 'Regístrate, carga videos, estadísticas e información esencial para validar tus habilidades.',
      extraClass: 'crea-perfil-bg'
    },
    {
  img: 'imagenes/imagen5.png',
      title: 'Conectá con scouts',
      desc: 'Los ojeadores podrán filtrar y encontrar tu perfil para conocerte mejor con información actualizada.',
      extraClass: 'conecta-scouts-bg'
    },
    {
  img: 'imagenes/imagen6.png',
      title: 'Recibí propuestas',
      desc: 'Si tu perfil coincide con lo que buscan, recibirás mensajes directos para pasar al siguiente nivel.',
      extraClass: 'recibi-propuestas-bg'
    }
  ];

  // Datos para ojeadores
  const ojeadoresSteps = [
    {
  img: 'imagenes/imagen7.png',
      title: 'Creá tu cuenta <span style="color:#00a66c">verificada</span>',
      desc: 'Registrate con tu correo profesional. Validamos tu identidad y tu vínculo con clubes, academias o entidades deportivas.',
      extraClass: ''
    },
    {
  img: 'imagenes/imagen8.png',
      title: 'Configurá tus <span style="color:#00a66c">criterios de búsqueda</span>',
      desc: 'Filtrá perfiles por edad, posición, características físicas y técnicas. Encontrá justo lo que estás buscando.',
      extraClass: ''
    },
    {
  img: 'imagenes/imagen9.png',
      title: 'Explorá el <span style="color:#00a66c">talento disponible</span>',
      desc: 'Accedé a perfiles juveniles verificados con videos, datos clave y referencias deportivas.',
      extraClass: ''
    },
    {
  img: 'imagenes/imagen10.png',
      title: 'Contacto <span style="color:#00a66c">directo y seguro</span>',
      desc: 'Comunicáte directamente con los futbolistas. Todo el proceso es seguro, sin intermediarios ni representantes.',
      extraClass: 'tarjeta tarjeta-ojeador fila-dos'
    },
    {
  img: 'imagenes/imagen11.png',
      title: 'Seguimiento <span style="color:#00a66c">personalizado</span>',
      desc: 'Guardá favoritos, hacé anotaciones privadas y organizá tu base de seguimiento.',
      extraClass: 'tarjeta tarjeta-ojeador fila-dos'
    },
    {
  img: 'imagenes/imagen12.png',
      title: 'Gestioná tus <span style="color:#00a66c">oportunidades</span>',
      desc: 'Evaluá candidatos, generá informes privados o compartí perfiles con tu equipo de trabajo.',
      extraClass: 'tarjeta tarjeta-ojeador fila-dos'
    }
  ];

  // Renderiza los pasos para futbolistas
  function renderSteps(steps, containerClass) {
    const container = document.querySelector(containerClass);
    if (!container) return;
    container.innerHTML = steps.map((step, i) => `
      <div class="cf-step ${step.extraClass}" style="background: #fff url('${step.img}') center/cover no-repeat; position: relative;">
        <div class="cf-step-circle" style="position: absolute; top: 24px; right: 24px;">${i + 1}</div>
        <div style="display: flex; flex-direction: column; justify-content: flex-end; height: 100%; padding: 32px 24px 40px 24px;">
          <h3 class="cf-step-title" style="font-size: 2.2rem; font-weight: bold; color: #fff; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">${step.title}</h3>
          <p class="cf-step-desc" style="font-size: 1.25rem; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.4); margin: 0;">${step.desc}</p>
        </div>
      </div>
    `).join('');
  }

  renderSteps(futbolistasSteps, '.cf-steps-futbolistas');
  renderSteps(ojeadoresSteps, '.cf-steps-ojeadores');
});
