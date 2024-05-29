"use client";

import { Identity, Role, User } from "@prisma/client";
import React, { createContext, useContext, useState } from "react";

export interface UserWithIdentities extends User {
  identities: Identity[];
  roles: Role[];
}

type TUsersContext = {
  users: UserWithIdentities[];
  setUsers: (users: UserWithIdentities[]) => void;
  page: number;
  setPage: (page: number) => void;
  total: number;
  setTotal: (total: number) => void;
  state: { users: UserWithIdentities[]; page: number; total: number };
  updateContext: (
    users: UserWithIdentities[],
    page: number,
    total: number,
  ) => void;
};

const UsersContext = createContext<TUsersContext>(
  null as unknown as TUsersContext,
);

export function UsersProvider(props: {
  children: React.ReactNode;
  users?: UserWithIdentities[];
  page: number;
  total: number;
}) {
  const [state, setState] = useState({
    users: props.users ?? [],
    page: props.page,
    total: props.total,
  });

  function updateContext(
    users: UserWithIdentities[],
    page: number,
    total: number,
  ) {
    setState({
      users,
      page,
      total,
    });
  }

  return (
    <UsersContext.Provider
      value={{
        users: state.users ?? [],
        setUsers: (users) => {
          setState({ ...state, users });
        },
        page: state.page,
        setPage: (page) => {
          setState({ ...state, page });
        },
        total: state.total,
        setTotal: (total) => {
          setState({ ...state, total });
        },
        state,
        updateContext,
      }}
    >
      {props.children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
