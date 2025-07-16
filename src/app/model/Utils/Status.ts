interface BadgeDtos { name: string; color: string }

export const METER_STATUS: any[] = [


  { name: "ACTIVE", color: "bg-success" },
  { name: "INACTIVE", color: "bg-secondary" },
  { name: "DISCONNECTED", color: "bg-warning" },
  { name: "OFFLINE", color: "bg-dark" },
  { name: "ERROR", color: "bg-danger" },
  { name: "MAINTENANCE", color: "bg-info" },
  { name: "LOW_BALANCE", color: "bg-warning" },
  { name: "ZERO_BALANCE", color: "bg-danger" }


];


export const METER_REQUEST_STATUS: any[] = [


  { name: "APPROVED", color: "bg-success" },
  { name: "PENDING", color: "bg-warning" },
  { name: "METERASSIGNED", color: "bg-dark" },
  { name: "REJECTED", color: "bg-danger" },


];
export const MODEM_STATUS: any[] = [


  { name: "ACTIVE", color: "bg-success" },
  { name: "INACTIVE", color: "bg-secondary" },
  { name: "DISCONNECTED", color: "bg-warning" },
  { name: "OFFLINE", color: "bg-dark" },
  { name: "ERROR", color: "bg-danger" },
  { name: "MAINTENANCE", color: "bg-info" },
  { name: "OPERATIONAL", color: "bg-danger" }


];

export const TRANSACTION_STATUS: any[] = [
  { name: "PENDING", color: "bg-warning" },
  { name: "COMPLETED", color: "bg-success" },
  { name: "FAILED", color: "bg-danger" },
  { name: "INITIATED", color: "bg-info" },
  { name: "ACCEPTED", color: "bg-success" },
  { name: "REJECTED", color: "bg-danger" },
  { name: "ERROR", color: "bg-danger" }
];

export const getCurrentStatus = (name: string, type: String): any => {
  let statusList = METER_STATUS;
  if (type === 'METER_STATUS') {
    statusList = METER_STATUS;

  } else if (type === 'METER_REQUEST_STATUS') {

    statusList = METER_REQUEST_STATUS;

  } else if (type === 'MODEM_STATUS') {
    statusList = MODEM_STATUS;
  } else if (type === 'TRANSACTION_STATUS') {
    statusList = TRANSACTION_STATUS;
  }
 else if (type === 'TRANSACTION_STATUS') {
  statusList = TRANSACTION_STATUS;
}
  console.log(statusList);

  const status: any = statusList.find((status) => status.name === name);
  if (status) return status;
  else return { name: "", color: "bg-danger" };
  //ERROR_MESSAGE.find
};
export const getPaymentMethodType=(type: string) :BadgeDtos => {
  const paymentTypes: { [key: string]: { name: string; color: string } } = {
    'GATEWAY': { name: 'GATEWAY', color: 'bg-purple' },
    'CASH': { name: 'CASH', color: 'bg-orange' },
    'WALLET': { name: 'WALLET', color: 'bg-info' },
    'BANK_TRANSFER': { name: 'BANK_TRANSFER', color: 'bg-warning' },
    'CREDIT_CARD': { name: 'CREDIT_CARD', color: 'bg-secondary' },
  };

  return paymentTypes[type] || { name: type, color: 'bg-secondary' };
}