import React, { useEffect, ReactNode } from "react";
import { useMachine } from "@xstate/react";
import {
  TransactionPagination,
  TransactionResponseItem,
  TransactionDateRangePayload,
  TransactionAmountRangePayload,
  User,
} from "../models";
import TransactionList from "./TransactionList";
import { publicTransactionsMachine } from "../machines/publicTransactionsMachine";

export interface TransactionPublicListProps {
  filterComponent: ReactNode;
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
  currentUser: User;
}

const TransactionPublicList: React.FC<TransactionPublicListProps> = ({
  filterComponent,
  dateRangeFilters,
  amountRangeFilters,
  currentUser,
}) => {
  const [current, send, publicTransactionService] = useMachine(publicTransactionsMachine);
  const { pageData, results } = current.context;

  // @ts-ignore
  if (window.Cypress) {
    // @ts-ignore
    window.publicTransactionService = publicTransactionService;
  }

  useEffect(() => {
    send("FETCH", { ...dateRangeFilters, ...amountRangeFilters });
  }, [send, dateRangeFilters, amountRangeFilters]);

  const loadNextPage = (page: number) =>
    send("FETCH", { page, ...dateRangeFilters, ...amountRangeFilters });

  return (
    <>
      <TransactionList
        filterComponent={filterComponent}
        header="Public"
        transactions={results as TransactionResponseItem[]}
        isLoading={current.matches("loading")}
        loadNextPage={loadNextPage}
        pagination={pageData as TransactionPagination}
        currentUser={currentUser}
        showCreateButton
      />
    </>
  );
};

export default TransactionPublicList;
