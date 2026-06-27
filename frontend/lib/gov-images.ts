/** Category-specific banner images and scheme visuals */
export const GOV_IMAGES = {
  landing:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Indian_Parliament_building.jpg/1280px-Indian_Parliament_building.jpg",
  login:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/India_Gate%2C_New_Delhi.jpg/1280px-India_Gate%2C_New_Delhi.jpg",
  onboarding:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Agriculture_in_India.jpg/1280px-Agriculture_in_India.jpg",
  twin:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
  dashboard:
    "https://images.unsplash.com/photo-1587474260587-13625ff24700?auto=format&fit=crop&w=1400&q=80",
  benefits:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
  missed:
    "https://images.unsplash.com/photo-1524492412937-280b9fd6780e?auto=format&fit=crop&w=1400&q=80",
  applications:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Delhi_Jal_Board_-_Citizens_Service_Centre.jpg/1280px-Delhi_Jal_Board_-_Citizens_Service_Centre.jpg",
  advocate:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Supreme_Court_of_India%2C_New_Delhi.jpg/1280px-Supreme_Court_of_India%2C_New_Delhi.jpg",
  agents:
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1400&q=80",
  government:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Rashtrapati_Bhavan%2C_New_Delhi.jpg/1280px-Rashtrapati_Bhavan%2C_New_Delhi.jpg",
  voice:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  apply:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Indian_government_office.jpg/1280px-Indian_government_office.jpg",
} as const;

export const CATEGORY_IMAGES: Record<string, string> = {
  health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  housing: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
  agriculture: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Agriculture_in_India.jpg/800px-Agriculture_in_India.jpg",
  finance: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
  insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  welfare: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
  employment: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
  skill: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
};

export function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] || GOV_IMAGES.benefits;
}
