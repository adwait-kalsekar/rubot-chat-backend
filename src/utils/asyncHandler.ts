import { NextFunction, Request, Response, RequestHandler } from "express";

const asyncHandler = (
  requestHandler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<Response | void>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    requestHandler(req, res, next)
      .then((response) => {
        if (!response) {
          return;
        }
      })
      .catch((err) => next(err));
  };
};

export default asyncHandler;
