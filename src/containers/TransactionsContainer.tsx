import React from "react";
import { useActor, useMachine } from "@xstate/react";
import { Switch, Route } from "react-router";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import { getDateQueryFields, getAmountQueryFields } from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

type TransactionsContainerProps = {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
};

const TransactionsContainer: React.FC<TransactionsContainerProps> = ({ authService }) => {
  const [currentFilters, sendFilterEvent] = useMachine(transactionFiltersMachine);
  const [authState] = useActor(authService);
  const currentUser = authState?.context?.user;

  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter",
  });

  const dateRangeFilters = hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters = hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  return (
    <Switch>
      <Route exact path="/contacts">
        <TransactionContactsList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
          currentUser={currentUser!}
        />
      </Route>
      <Route exact path="/personal">
        <TransactionPersonalList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
          currentUser={currentUser!}
        />
      </Route>
      <Route exact path="/(public)?">
        <TransactionPublicList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
          currentUser={currentUser!}
        />
      </Route>
    </Switch>
  );
};

export default TransactionsContainer;
