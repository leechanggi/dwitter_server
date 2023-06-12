export {};

declare global {
  namespace Express {
    interface Request {
      // userId?: import("../entities/User").default;
      userId?: any;
    }
  }
}
