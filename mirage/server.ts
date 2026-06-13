import { createServer, Model, Response } from "miragejs";
import usersData from "../data/users.json";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    models: {
      user: Model,
    },

    seeds(server) {
      // Seed Mirage's database with the 500 users generated earlier
      usersData.forEach((user) => {
        server.create("user", user);
      });
    },

    routes() {
      // Use the namespace that matches your expected API path
      this.namespace = "api";

      // Add a slight delay to simulate network latency
      this.timing = 500;

      // 1. Mock Login Endpoint
      this.post("/auth/login", (schema, request) => {
        let attrs;
        try {
          attrs = JSON.parse(request.requestBody);
        } catch (e) {
          return new Response(
            400,
            {},
            { status: "error", message: "Invalid JSON" },
          );
        }

        if (attrs.email && attrs.password) {
          return new Response(
            200,
            {},
            {
              status: "success",
              message: "Login successful",
              data: {
                user: {
                  id: "1",
                  email: attrs.email,
                  firstName: "Admin",
                  lastName: "User",
                },
                token: "mock-jwt-token-lendsqr-12345",
                expiresIn: 3600000,
              },
            },
          );
        }

        return new Response(
          401,
          {},
          {
            status: "error",
            message: "Invalid credentials",
          },
        );
      });

      // 2. Get All Users (with Filtering, Pagination, Sorting)
      this.get("/users", (schema: any, request) => {
        const authHeader = request.requestHeaders.authorization || request.requestHeaders.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-token')) {
          return new Response(401, {}, { status: "error", message: "Unauthorized: Missing or invalid token" });
        }

        let allUsers = schema.all("user").models;

        // Extract Query Parameters
        const page = parseInt((request.queryParams.page as string) || "1");
        const limit = parseInt((request.queryParams.limit as string) || "10");
        const organization = request.queryParams.organization as
          | string
          | undefined;
        const username = request.queryParams.username as string | undefined;
        const email = request.queryParams.email as string | undefined;
        const phoneNumber = request.queryParams.phoneNumber as
          | string
          | undefined;
        const status = request.queryParams.status as string | undefined;
        const dateFrom = request.queryParams.dateFrom as string | undefined;

        // Apply Filters
        if (organization) {
          allUsers = allUsers.filter(
            (u: any) =>
              u.organization.toLowerCase() === organization.toLowerCase(),
          );
        }
        if (username) {
          allUsers = allUsers.filter((u: any) =>
            u.username.toLowerCase().includes(username.toLowerCase()),
          );
        }
        if (email) {
          allUsers = allUsers.filter((u: any) =>
            u.email.toLowerCase().includes(email.toLowerCase()),
          );
        }
        if (phoneNumber) {
          allUsers = allUsers.filter((u: any) =>
            u.phoneNumber.includes(phoneNumber),
          );
        }
        if (status) {
          allUsers = allUsers.filter(
            (u: any) => u.status.toLowerCase() === status.toLowerCase(),
          );
        }
        if (dateFrom) {
          allUsers = allUsers.filter(
            (u: any) => new Date(u.dateJoined) >= new Date(dateFrom),
          );
        }

        // Apply Pagination
        const total = allUsers.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = allUsers.slice(startIndex, endIndex);

        return new Response(
          200,
          {},
          {
            status: "success",
            message: "Users retrieved successfully",
            data: {
              users: paginatedUsers.map((u: any) => ({
                id: u.id,
                organization: u.organization,
                username: u.username,
                email: u.email,
                phoneNumber: u.phoneNumber,
                dateJoined: u.dateJoined,
                status: u.status,
              })),
              pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
              },
            },
          },
        );
      });

      // 3. Get Single User Details
      this.get("/users/:id", (schema: any, request) => {
        const authHeader = request.requestHeaders.authorization || request.requestHeaders.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-token')) {
          return new Response(401, {}, { status: "error", message: "Unauthorized: Missing or invalid token" });
        }

        let id = request.params.id;
        let user = schema.findBy("user", { id });

        if (!user) {
          return new Response(
            404,
            {},
            {
              status: "error",
              message: "User not found",
            },
          );
        }

        // Return the full user object (excluding the internal Mirage data)
        return new Response(
          200,
          {},
          {
            status: "success",
            message: "User retrieved successfully",
            data: user.attrs,
          },
        );
      });

      // 4. Get User Stats
      this.get("/users/stats", (schema: any, request) => {
        const authHeader = request.requestHeaders.authorization || request.requestHeaders.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-token')) {
          return new Response(401, {}, { status: "error", message: "Unauthorized: Missing or invalid token" });
        }

        const allUsers = schema.all("user").models;
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter((u: any) => u.status === "active").length;
        const usersWithLoans = allUsers.filter((u: any) => u.loanInformation && u.loanInformation.totalLoans > 0).length;
        const usersWithSavings = allUsers.filter((u: any) => u.savings && u.savings.totalSavings > 0).length;

        return new Response(
          200,
          {},
          {
            status: "success",
            message: "Stats retrieved successfully",
            data: {
              totalUsers,
              activeUsers,
              usersWithLoans,
              usersWithSavings,
            },
          }
        );
      });

      // 5. Update User Status
      this.put("/users/:id", (schema: any, request) => {
        const authHeader = request.requestHeaders.authorization || request.requestHeaders.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-token')) {
          return new Response(401, {}, { status: "error", message: "Unauthorized: Missing or invalid token" });
        }

        const id = request.params.id;
        const user = schema.findBy("user", { id });

        if (!user) {
          return new Response(
            404,
            {},
            {
              status: "error",
              message: "User not found",
            },
          );
        }

        let attrs;
        try {
          attrs = JSON.parse(request.requestBody);
        } catch (e) {
          return new Response(
            400,
            {},
            {
              status: "error",
              message: "Invalid request body",
            },
          );
        }

        user.update(attrs);

        return new Response(
          200,
          {},
          {
            status: "success",
            message: "User updated successfully",
            data: user.attrs,
          },
        );
      });

      // Let unhandled requests pass through to avoid breaking Next.js hot-reloading and RSC prefetching
      this.passthrough((request) => {
        return !request.url.includes("/api/");
      });
    },
  });
}
