import crashesRoutes from "./crashes.js";
import authRoutes from "./auth_routes.js";
import usersRoutes from "./users.js";

const constructorMethod = (app) => {
	app.use("/", authRoutes);
	app.use("/crashes", crashesRoutes);
	app.use("/users", usersRoutes);

	app.use((req, res) => {
		const isUserLoggedIn = req.session && req.session.user;

    res.status(404).render("error", {
      title: "Page Not Found",
      subTitle: "404 Error",
      error: "Not Found",
      user: isUserLoggedIn ? req.session.user : null,
    });
  });
};

export default constructorMethod;
