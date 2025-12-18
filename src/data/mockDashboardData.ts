import { VisitRecord } from '@/types/dashboard';

const states = [
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh',
  'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana',
  'West Bengal', 'Bihar', 'Odisha', 'Punjab', 'Haryana'
];

const districtsByState: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak']
};

const blocksByDistrict: Record<string, string[]> = {
  'Pune': ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Junnar', 'Ambegaon', 'Baramati', 'Indapur'],
  'Mumbai': ['Andheri', 'Borivali', 'Kurla', 'Bandra', 'Malad'],
  'Nagpur': ['Nagpur Rural', 'Kamptee', 'Hingna', 'Saoner', 'Umred'],
  'Ahmedabad': ['Daskroi', 'Sanand', 'Dholka', 'Bavla', 'Viramgam'],
  'Jaipur': ['Amber', 'Sanganer', 'Bassi', 'Chaksu', 'Phagi'],
};

const months = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

const generateBACs = (state: string, district: string, block: string): string[] => {
  const prefix = `BAC-${state.substring(0, 2).toUpperCase()}-${district.substring(0, 3).toUpperCase()}`;
  return Array.from({ length: 3 }, (_, i) => `${prefix}-${block.substring(0, 3).toUpperCase()}-${i + 1}`);
};

export const generateMockData = (academicYear: string = '2023-2024'): VisitRecord[] => {
  const records: VisitRecord[] = [];
  let id = 1;

  states.forEach(state => {
    const districts = districtsByState[state] || ['District 1', 'District 2', 'District 3'];
    
    districts.forEach(district => {
      const blocks = blocksByDistrict[district] || [`Block 1`, `Block 2`, `Block 3`];
      
      blocks.forEach(block => {
        const bacs = generateBACs(state, district, block);
        
        bacs.forEach((bacId, bacIndex) => {
          months.forEach((month, monthIndex) => {
            const recommended = 20;
            // Some BACs have lower targets (underplanning)
            const isUnderplanner = Math.random() < 0.25;
            const target = isUnderplanner 
              ? Math.floor(recommended * (0.5 + Math.random() * 0.4))
              : Math.floor(recommended * (0.8 + Math.random() * 0.25));
            
            // Some BACs consistently miss targets (chronic performers)
            const isChronicPerformer = Math.random() < 0.2;
            const performanceRate = isChronicPerformer
              ? 0.4 + Math.random() * 0.4
              : 0.7 + Math.random() * 0.35;
            
            const actual = Math.min(Math.floor(target * performanceRate), target + 5);
            const classroomObs = Math.floor(actual * (0.6 + Math.random() * 0.3));

            records.push({
              id: `visit_${String(id++).padStart(6, '0')}`,
              academic_year: academicYear,
              month,
              month_index: monthIndex,
              state,
              district,
              block,
              bac_id: bacId,
              bac_name: `Officer ${district} ${bacIndex + 1}`,
              recommended_visits: recommended,
              target_visits: target,
              actual_visits: actual,
              classroom_obs: classroomObs,
              school_id: `SCH-${state.substring(0, 2).toUpperCase()}-${district.substring(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
              arp_id: `ARP-${state.substring(0, 2).toUpperCase()}-${district.substring(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 50)).padStart(2, '0')}`,
              visit_type: Math.random() > 0.3 ? 'Individual' : 'Joint'
            });
          });
        });
      });
    });
  });

  return records;
};

export const getUniqueValues = (data: VisitRecord[], field: keyof VisitRecord): string[] => {
  return [...new Set(data.map(d => String(d[field])))].sort();
};

export const academicYears = ['2023-2024', '2022-2023', '2021-2022'];

export const mockData = generateMockData('2023-2024');
