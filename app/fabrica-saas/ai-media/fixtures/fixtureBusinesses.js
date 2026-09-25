// Fixture Businesses — ADV-13

export const FIXTURE_BUSINESS_VETERINARY = Object.freeze({
  id: 'biz_vet_01', name: 'Clínica Veterinaria Sana Vida', vertical: 'VETERINARY',
  address: 'Calle Mayor 12, Archidona', phone: '+34 951 000 001',
  services: ['Consultas', 'Vacunación', 'Cirugía', 'Urgencias'],
  hours: 'L-V 9-20h, S 9-14h', isReal: false,
});

export const FIXTURE_BUSINESS_PADEL = Object.freeze({
  id: 'biz_pad_01', name: 'Club Pádel 04', vertical: 'PADEL_CLUB',
  address: 'Polígono Norte, Archidona', phone: '+34 951 000 002',
  services: ['Reserva de pistas', 'Clases', 'Torneos', 'Tienda'],
  hours: 'L-D 8-23h', isReal: false,
});

export const FIXTURE_BUSINESS_LEGAL = Object.freeze({
  id: 'biz_leg_01', name: 'Despacho Rodríguez & Asociados', vertical: 'LEGAL',
  address: 'Plaza España 5, Antequera', phone: '+34 951 000 003',
  services: ['Derecho laboral', 'Derecho civil', 'Consultas', 'Contratos'],
  hours: 'L-V 9-14h / 16-19h', isReal: false,
});

export const FIXTURE_BUSINESS_BEAUTY = Object.freeze({
  id: 'biz_bty_01', name: 'Centro de Belleza Glam', vertical: 'BEAUTY',
  address: 'Calle Ancha 33, Archidona', phone: '+34 951 000 004',
  services: ['Corte', 'Coloración', 'Manicura', 'Tratamientos faciales'],
  hours: 'L-S 9-20h', isReal: false,
});

export const FIXTURE_BUSINESS_EDUCATION = Object.freeze({
  id: 'biz_edu_01', name: 'Academia EducaArchidona', vertical: 'EDUCATION',
  address: 'Calle Escuelas 7, Archidona', phone: '+34 951 000 005',
  services: ['Clases particulares', 'Inglés', 'Matemáticas', 'Preparación exámenes'],
  hours: 'L-V 9-21h', isReal: false,
});

export const FIXTURE_BUSINESS_PHYSIO = Object.freeze({
  id: 'biz_fis_01', name: 'FisioNova Clínica', vertical: 'PHYSIOTHERAPY',
  address: 'Avenida Salud 18, Archidona', phone: '+34 951 000 006',
  services: ['Fisioterapia deportiva', 'Masajes', 'Osteopatía', 'Pilates'],
  hours: 'L-V 8-21h, S 9-14h', isReal: false,
});

export const FIXTURE_BUSINESSES = Object.freeze([
  FIXTURE_BUSINESS_VETERINARY, FIXTURE_BUSINESS_PADEL, FIXTURE_BUSINESS_LEGAL,
  FIXTURE_BUSINESS_BEAUTY, FIXTURE_BUSINESS_EDUCATION, FIXTURE_BUSINESS_PHYSIO,
]);
