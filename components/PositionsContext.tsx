"use client";

import { Position } from "@prisma/client";
import React, { createContext, useContext, useState } from "react";

type TPositionsContext = {
  positions: Position[];
  setPositions: (positions: Position[]) => void;
  page: number;
  setPage: (page: number) => void;
  total: number;
  setTotal: (total: number) => void;
  state: { positions: Position[]; page: number; total: number };
  updateContext: (positions: Position[], page: number, total: number) => void;
};

const PositionsContext = createContext<TPositionsContext>(
  null as unknown as TPositionsContext,
);

export function PositionsProvider(props: {
  children: React.ReactNode;
  positions?: Position[];
  page: number;
  total: number;
}) {
  const [state, setState] = useState({
    positions: props.positions ?? [],
    page: props.page,
    total: props.total,
  });

  function updateContext(positions: Position[], page: number, total: number) {
    setState({
      positions,
      page,
      total,
    });
  }

  return (
    <PositionsContext.Provider
      value={{
        positions: state.positions ?? [],
        setPositions: (positions) => {
          setState({ ...state, positions });
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
    </PositionsContext.Provider>
  );
}

export const usePositions = () => useContext(PositionsContext);
