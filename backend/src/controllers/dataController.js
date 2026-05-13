const getMetadata = async (req, res) => {
  // Mock data for dropdowns - in a real app, these might come from the DB
  const metadata = {
    services: [
      { id: 'arc_welding', name: 'Arc Welding', price: 1500 },
      { id: 'mig_welding', name: 'MIG Welding', price: 2500 },
      { id: 'tig_welding', name: 'TIG Welding', price: 3500 },
      { id: 'structural_repair', name: 'Structural Repair', price: 5000 }
    ],
    technicians: [
      { id: 'tech_1', name: 'Rajesh Kumar', rating: 4.8, experience: '10 years' },
      { id: 'tech_2', name: 'Suresh Patil', rating: 4.5, experience: '7 years' },
      { id: 'tech_3', name: 'Amit Singh', rating: 4.9, experience: '12 years' }
    ],
    damageTypes: [
      { id: 'crack', name: 'Structural Crack' },
      { id: 'rust', name: 'Surface Rust' },
      { id: 'bend', name: 'Bending' },
      { id: 'break', name: 'Complete Breakage' }
    ]
  };

  res.json(metadata);
};

module.exports = {
  getMetadata
};
