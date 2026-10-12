const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const landingImages = {
  hero: {
    students: photo('photo-1427504494785-3a9ca7044f45'),
    teacher: photo('photo-1509062522246-3755977927d7'),
    classroom: photo('photo-1580582932707-520aed937b7b'),
  },
  roles: {
    admin: photo('photo-1454165804606-c3d57bc86b40'),
    teacher: photo('photo-1577896851231-70ef18881754'),
    student: photo('photo-1503676260728-1c00da094a0b'),
    parent: photo('photo-1609220136736-443140cffec6'),
  },
  avatars: {
    maryam: photo('photo-1544005313-94ddf0286df2'),
    reza: photo('photo-1500648767791-00dcc994a43e'),
    sara: photo('photo-1438761681033-6461ffad8d80'),
  },
  campus: {
    group: photo('photo-1523050854058-8df90110c9f1'),
    studying: photo('photo-1434030216411-0b793f4b4173'),
    library: photo('photo-1521587760476-6c12a4b040da'),
    computer: photo('photo-1516321318423-f06f85e504b3'),
    parent: photo('photo-1476703993599-0035a21b17a9'),
    graduation: photo('photo-1523050854058-8df90110c9f1'),
  },
};
