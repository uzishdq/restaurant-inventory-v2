import { roleType } from "./type.helper";

//TYPE
export type TUser = {
  idUser: string;
  name: string;
  username: string;
  phone: string;
  role: roleType;
  createdAt: Date;
};
