import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    basepath: "/sacred-pages",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
