"use client";

import { RoleWithPermissions } from "@/features/people";
import React, { createContext, useContext, useState } from "react";

type TRolesContext = {
  roles: RoleWithPermissions[];
  setRoles: (roles: RoleWithPermissions[]) => void;
  page: number;
  setPage: (page: number) => void;
  total: number;
  setTotal: (total: number) => void;
  state: { roles: RoleWithPermissions[]; page: number; total: number };
  updateContext: (
    roles: RoleWithPermissions[],
    page: number,
    total: number,
  ) => void;
};

const RolesContext = createContext<TRolesContext>(
  null as unknown as TRolesContext,
);

export function RolesProvider(props: {
  children: React.ReactNode;
  roles?: RoleWithPermissions[];
  page: number;
  total: number;
}) {
  const [state, setState] = useState({
    roles: props.roles ?? [],
    page: props.page,
    total: props.total,
  });

  function updateContext(
    roles: RoleWithPermissions[],
    page: number,
    total: number,
  ) {
    setState({
      roles,
      page,
      total,
    });
  }

  return (
    <RolesContext.Provider
      value={{
        roles: state.roles ?? [],
        setRoles: (roles) => {
          setState({ ...state, roles });
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
    </RolesContext.Provider>
  );
}

export const useRoles = () => useContext(RolesContext);
