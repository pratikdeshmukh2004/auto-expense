// Validation helper at top of component
const getValidationState = (message: any, editingFields: any) => {
  const editedData = editingFields[message.id];
  const merchant = editedData?.merchant || message.merchant;
  const amount = editedData?.amount || message.amount;
  const category = editedData?.category || message.category;
  
  const isValidMerchant = merchant && merchant.trim().length > 0;
  const isValidAmount = amount && parseFloat(amount) > 0;
  const isValidCategory = category && category !== 'Others' && category !== 'Other';
  const canApprove = isValidMerchant && isValidAmount && isValidCategory;
  
  return { isValidMerchant, isValidAmount, isValidCategory, canApprove };
};
