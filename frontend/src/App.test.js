import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { useAuth } from "./context/AuthContext";

jest.mock("./context/AuthContext", () => {
  const actual = jest.requireActual("./context/AuthContext");
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

const renderAtRoute = (route) => {
  window.history.pushState({}, "Test page", route);
  return render(<App />);
};

beforeEach(() => {
  useAuth.mockReturnValue({
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  });
});

test("login shows a validation error when fields are empty", async () => {
  renderAtRoute("/login");

  userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Please fill in all fields.");
});

test("login shows loading state and API errors", async () => {
  const login = jest.fn(
    () =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Network error")), 20);
      })
  );
  useAuth.mockReturnValue({
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    login,
    register: jest.fn(),
    logout: jest.fn(),
  });

  renderAtRoute("/login");

  userEvent.type(screen.getByLabelText(/email address/i), "user@example.com");
  userEvent.type(screen.getByLabelText(/^password$/i), "password123");
  userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  expect(screen.getByLabelText(/email address/i)).toBeDisabled();

  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
});

test("register shows validation errors when submitted empty", async () => {
  renderAtRoute("/register");

  userEvent.click(screen.getByRole("button", { name: /create account/i }));

  expect(await screen.findByText("Full name is required.")).toBeInTheDocument();
  expect(screen.getByText("Email is required.")).toBeInTheDocument();
  expect(screen.getByText("Password is required.")).toBeInTheDocument();
  expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
});

test("register shows loading state and API errors", async () => {
  const register = jest.fn(
    () =>
      new Promise((_, reject) => {
        setTimeout(
          () =>
            reject({
              response: {
                data: {
                  message: "Email is already registered.",
                },
              },
            }),
          20
        );
      })
  );
  useAuth.mockReturnValue({
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    login: jest.fn(),
    register,
    logout: jest.fn(),
  });

  renderAtRoute("/register");

  userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
  userEvent.type(screen.getByLabelText(/email address/i), "jane@example.com");
  userEvent.type(screen.getByLabelText(/^password$/i), "Password1");
  userEvent.type(screen.getByLabelText(/confirm password/i), "Password1");
  userEvent.click(screen.getByRole("button", { name: /create account/i }));

  expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
  expect(screen.getByLabelText(/full name/i)).toBeDisabled();

  await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("alert")).toHaveTextContent("Email is already registered.");
});
