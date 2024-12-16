import React from "react";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { TransactionResponseItem, User } from "../models";
import { isRequestTransaction, formatAmount, transactionSign } from "../utils/transactionUtils";

const PREFIX = "TransactionAmount";

const classes = {
  amountPositive: `${PREFIX}-amountPositive`,
  amountNegative: `${PREFIX}-amountNegative`,
  amountNeutral: `${PREFIX}-amountNeutral`,
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  [`&.${classes.amountPositive}`]: {
    fontSize: 24,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.body1.fontSize,
    },
    color: "#4CAF50",
  },

  [`&.${classes.amountNegative}`]: {
    fontSize: 24,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.body1.fontSize,
    },
    color: "red",
  },

  [`&.${classes.amountNeutral}`]: {
    fontSize: 24,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.body1.fontSize,
    },
    color: "#666",
  },
})) as typeof Typography;

const TransactionAmount: React.FC<{
  transaction: TransactionResponseItem;
  currentUser: User;
}> = ({ transaction, currentUser }) => {
  const sign = transactionSign(transaction, currentUser.id);

  return (
    <StyledTypography
      data-test={`transaction-amount-${transaction.id}`}
      className={
        {
          "+": classes.amountPositive,
          "-": classes.amountNegative,
          "": classes.amountNeutral,
        }[sign]
      }
      display="inline"
      component="span"
      color="primary"
    >
      {sign}
      {transaction.amount && formatAmount(transaction.amount)}
    </StyledTypography>
  );
};

export default TransactionAmount;
