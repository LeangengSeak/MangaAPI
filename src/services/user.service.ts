import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import {
  UpdateData,
  UpdatePassword,
} from "../shared/interfaces/user.interface";
import { BadRequestException } from "../shared/utils/catch-errors";

export class UserService {
  public async getUserById(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return user || null;
  }

  public async updateInfo(userId: string, updateData: UpdateData) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return user || null;
  }

  public async updateAvatar(userId: string, avatarUrl: string) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true, runValidators: true }
    );
    return user || null;
  }

  public async deleteAvatar(userId: string) {
    const defaultAvatar = "https://i.ibb.co/4pDNDk1/avatar.png";

    await UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: defaultAvatar } },
      { new: true, runValidators: true }
    );
    return 
  }

  public async updatePassword(userId: string, updatePassword: UpdatePassword) {
    const { oldPassword, newPassword, confirmPassword } = updatePassword;
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new BadRequestException("Old password is incorrect");
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        "New password and confirm password do not match"
      );
    }

    user.password = newPassword;
    await user.save();

    return;
  }

  public async deleteAcount(userId: string) {

    const deleteUser = await UserModel.findByIdAndDelete(userId)

    if (!deleteUser) throw new BadRequestException("User not found or already deleted.")
    
    await SessionModel.deleteMany({ userId });
    
    return { deleted: true }
    
  }
}
