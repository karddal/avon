export type UnitOption = {
  id: string;
  name: string;
  unit_code: string;
  programme_start_date: string;
  programme_end_date: string;
};

export type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
  start_date: string;
  end_date: string;
};

export interface FormProps {
  units: UnitOption[];
}
