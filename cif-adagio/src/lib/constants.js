// Catálogo base de la escuela — grupos, niveles, métodos de pago, etc.
// Ninguno de estos valores se persiste; son la configuración fija del negocio.

export const GROUPS = [
  { id: "adultos", name: "Adultos", price: 30, classPrice: 10, color: "#0EA5A5" },
  { id: "sabatino", name: "Niñas Sabatino", price: 30, color: "#7C5CBF" },
  { id: "preballet", name: "Preballet", price: 35, color: "#E17DA0" },
  { id: "iniciacion", name: "Iniciación", price: 50, color: "#7C5CBF" },
  { id: "intermedio", name: "Intermedio", price: 70, color: "#3454D1" },
  { id: "avanzado", name: "Avanzado", price: 80, color: "#1B2A57" },
  { id: "salsa", name: "Salsa (sábados)", price: 25, pairPrice: 40, color: "#B8935B" },
];

export const GROUPS_NO_INSCRIPTION = ["adultos", "salsa"];
export const requiresInscription = (groupId) => !GROUPS_NO_INSCRIPTION.includes(groupId);
export const groupById = (id) => GROUPS.find((g) => g.id === id);

// Niveles internos por grupo: es la misma mensualidad del grupo, solo marca el avance
// para que los representantes vean progreso año con año.
export const LEVELS_BY_GROUP = {
  preballet: [
    { id: "I", label: "Nivel I" },
    { id: "II", label: "Nivel II" },
  ],
  iniciacion: [
    { id: "I", label: "Nivel I" },
    { id: "II", label: "Nivel II" },
  ],
  intermedio: [
    { id: "I", label: "Nivel I" },
    { id: "II", label: "Nivel II" },
  ],
  avanzado: [
    { id: "II", label: "Año II" },
    { id: "III", label: "Año III" },
    { id: "IV", label: "Año IV" },
    { id: "V", label: "Año V", highlight: true },
    { id: "VI", label: "Año VI", highlight: true },
  ],
};
export const LEVEL_HIGHLIGHT_COLOR = "#7B1E3A";

export const levelsForGroup = (groupId) => LEVELS_BY_GROUP[groupId] || [];
export const levelLabel = (groupId, levelId) =>
  levelsForGroup(groupId).find((l) => l.id === levelId)?.label || "";

export const PAYMENT_METHODS = [
  { id: "pago_movil", label: "Pago móvil", currency: "VES" },
  { id: "transferencia", label: "Transferencia (Bs)", currency: "VES" },
  { id: "paypal", label: "PayPal", currency: "USD" },
  { id: "banesco_panama", label: "Banesco Panamá", currency: "USD" },
  { id: "efectivo_divisas", label: "Efectivo (divisas)", currency: "USD" },
];
export const paymentMethodInfo = (id) =>
  PAYMENT_METHODS.find((m) => m.id === id) || { id, label: id || "—", currency: "USD" };

export const PAYMENT_SCHEDULE_LABELS = {
  mensual: "Mensual",
  quincenal: "Quincenal",
  bimestral: "Bimestral (cada 2 meses)",
};

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
export const DAY_HEADERS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const EVENT_TYPES = [
  { id: "ensayo", label: "Ensayo", color: "#4A6491" },
  { id: "clase_general", label: "Clase general", color: "#0EA5A5" },
  { id: "evento", label: "Evento / función", color: "#B8935B" },
  { id: "otro", label: "Otro", color: "#6E7893" },
];
export const eventTypeInfo = (id) => EVENT_TYPES.find((t) => t.id === id) || EVENT_TYPES[3];

// Reglamento oficial de CIF Adagio, transcrito verbatim para mostrarlo en la app.
export const REGLAMENTO = [
  {
    title: "1. Inscripción y pago",
    items: [
      "La reinscripción debe realizarse anualmente en el mes de septiembre.",
      "El pago de las mensualidades debe cancelarse los primeros cinco (5) días de cada mes, sin excepción.",
      "Los pagos referentes a las funciones y cuotas extraordinarias deben realizarse en la fecha que la dirección estime necesario.",
      "Todos los pagos deben cargarse dentro de la plataforma de CIF Adagio, con su comprobante o referencia correspondiente, para que la administración pueda confirmarlos.",
      "No se realizan devoluciones de dinero bajo ninguna circunstancia.",
      "Las personas con pagos pendientes estarán sujetas a un incremento de 5$ de su mensualidad.",
      "Todos los pagos deben ser realizados y notificados a la administración de la escuela.",
      "La escuela se reserva el derecho de realizar ajustes en la mensualidad o establecer cuotas especiales durante el año escolar. Los padres y representantes serán notificados con la debida anticipación.",
      "Los pagos correspondientes a los meses de agosto y diciembre deberán cancelarse en el mes anterior: agosto se paga en julio, y diciembre se paga en noviembre.",
    ],
  },
  {
    title: "2. Constancias y reuniones",
    items: [
      "Cualquier reunión con la junta directiva de la escuela debe ser realizada previa cita, sin excepción.",
      "Las constancias se entregarán 5 días hábiles después de la fecha en que fueron solicitadas.",
      "Cualquier queja, opinión o crítica constructiva deberá tratarse directamente con la directiva mediante una cita presencial. No se aceptarán discusiones ni trámites relacionados por vía telefónica o fuera de las instalaciones.",
    ],
  },
  {
    title: "3. Uniforme",
    items: [
      "El uniforme es de uso obligatorio y adquirible solo en la institución.",
      "El cabello debe estar siempre recogido en un moño para los estudiantes de ballet, o cola de caballo para los de contemporáneo.",
      "El uso del uniforme es obligatorio para el ingreso a clase. Solo se permitirá el ingreso sin uniforme durante el primer mes luego de formalizada la inscripción.",
    ],
  },
  {
    title: "4. Clases y comportamiento",
    items: [
      "Los padres y representantes no podrán interrumpir las actividades bajo ninguna circunstancia.",
      "El estudiante deberá mantener el orden en los espacios de clase, velando por la integridad de las instalaciones y por su apariencia física dentro y fuera de la misma.",
      "El estudiante deberá venir con su ropa de trabajo ya lista para su actividad.",
      "No podrá utilizar zarcillos, cadenas o pendientes mientras realiza la clase.",
      "No se permite el uso de uñas pintadas ni maquillaje para las actividades regulares.",
      "La institución no se hace responsable por la pérdida de artículos de valor que traiga el alumno.",
      "El estudiante no podrá salir en ropa de trabajo fuera de la escuela; deberá usar el mono y chaqueta del uniforme sobre la ropa de trabajo.",
      "Los estudiantes no podrán estar acompañados por familiares y/o amigos dentro de las instalaciones.",
      "Prohibido el consumo de bebidas alcohólicas o estupefacientes dentro de las instalaciones.",
      "Prohibido fumar dentro de las instalaciones.",
      "Toda inasistencia debe notificarse a la administración con la debida antelación; se toma en cuenta en la evaluación final de cada año.",
      "Se prohíbe cualquier actitud tóxica, crítica o maltrato entre padres, representantes o estudiantes hacia cualquier miembro de la comunidad educativa.",
      "Todos los miembros de la escuela deben mostrar respeto y consideración hacia los demás.",
    ],
  },
  {
    title: "5. Horario",
    items: [
      "La asistencia es obligatoria y de mayor importancia en temporada de montaje; de no asistir se debe avisar con anterioridad.",
      "Los padres y representantes deberán traer a su representada 10 minutos antes de comenzar la clase, y estar presentes para retirarla 10 minutos antes de culminar.",
      "El alumno tendrá hasta diez minutos de tolerancia en caso de retraso. Al exceder ese tiempo no podrá entrar a la clase.",
      "El horario puede sufrir cambios a lo largo del año escolar.",
    ],
  },
  {
    title: "6. Producciones, festivales y concursos",
    items: [
      "La inscripción a concursos o clases magistrales corre por parte del representante.",
      "La participación y entrenamiento para concursos tiene un costo adicional, al ser un entrenamiento aparte de la formación académica.",
      "En caso de retraso durante temporada de montajes, el alumno tiene la obligación de quedarse para calentar y asistir a su ensayo correspondiente.",
      "Los horarios de clase podrán alargarse en periodos de montajes, funciones, concursos o festivales.",
      "Es posible que se tomen otros días aparte del horario académico para realizar ensayos.",
      "La asistencia es obligatoria; si el estudiante debe faltar, es necesario un justificativo.",
      "Solo podrán inscribirse en concursos, festivales o eventos aquellos estudiantes que cumplan los criterios de admisión establecidos por la escuela. La decisión final la determina la directiva según desempeño, compromiso y habilidades demostradas.",
      "Los vestuarios y tocados corren por parte del representante; el vestuario se realiza solo con la costurera oficial de la escuela, para prevenir problemas.",
    ],
  },
  {
    title: "7. Venta de artículos",
    items: ["Queda terminantemente prohibida la venta de cualquier artículo dentro de las instalaciones de la escuela."],
  },
];

export const REGLAMENTO_CIERRE =
  "Las personas que incurran en alguna falta de este reglamento podrán ser sancionadas si así se considera por la institución. La escuela se reserva el derecho de admisión ante cualquier infracción grave. Cualquier sanción que implique una violación significativa de las reglas será evaluada por la administración, pudiendo resultar en la exclusión temporal o permanente del infractor. Este reglamento puede sufrir cambios durante el período escolar.";
