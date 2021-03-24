export interface BoardItem {
  isViewContainer?: boolean;
  id: string;
  aircraft_type_name: string;
  flt: number;
  dat: string;
  estimated_chin_start: string;
  co: {
    name: string
  };
  mar1: {
    iata: string;
    city: string
  };
  mar2: {
    iata: string;
    city: string
  };
  vip_status_eng: string;
  gate_id: string;
  t_boarding_start: string;
  t_bording_finish: string;
  status_code: number;
}
