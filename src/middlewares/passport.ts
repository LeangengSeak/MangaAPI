import passport from "passport";
import { setupJwtStrategy } from "../shared/strategies/jwt.strategy"

const initializePassport = () => {
    setupJwtStrategy(passport);
}

initializePassport()
export default passport