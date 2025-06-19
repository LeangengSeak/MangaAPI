import { createTransport } from 'nodemailer'
import { config } from '../config/app.config'

export const transporter = createTransport({
  service: 'gmail',
  auth:{
    user: config.SENDING_EMAIL_ADDRESS,
    pass: config.SENDING_EMAIL_PASSWORD
  }
})