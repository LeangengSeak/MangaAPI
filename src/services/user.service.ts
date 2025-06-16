import UserModel from "../models/user.model";

export class UserService {
  public async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    return user || null;
  }
}
