// utils/progressHelpers.js
export const getProgressValue = (status) => {
  switch (status) {
    case 'In route for pick up': return 25;
    case 'Waiting for paperwork': return 50;
    case 'Heading to customer': return 75;
    case 'Delivered': return 100;
    default: return 0;
  }
};

export const getProgressColor = (status) => {
  switch (status) {
    case 'In route for pick up': return 'info';
    case 'Waiting for paperwork': return 'warning';
    case 'Heading to customer': return 'secondary';
    case 'Delivered': return 'success';
    default: return 'primary';
  }
};
