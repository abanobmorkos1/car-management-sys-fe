import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import SignatureModal from './SignatureModal';
import ownerSignature from '../assets/ownersign.png';

// Custom lined textarea component
function LinedTextArea({ value, onChange, disabled, rows = 3 }) {
  const lineHeight = 22;
  const lines = Array.from({ length: rows }, (_, i) => i);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Render actual lines */}
      {lines.map((line) => (
        <Box
          key={line}
          sx={{
            position: 'absolute',
            top: `${(line + 1) * lineHeight - 1}px`,
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: '#000',
            zIndex: 1,
          }}
        />
      ))}
      <TextField
        variant="standard"
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        disabled={disabled}
        multiline
        rows={rows}
        value={value}
        onChange={onChange}
        sx={{
          width: '100%',
          '& .MuiInput-root': {
            '&:before': {
              borderBottom: 'none',
            },
            '&:hover:not(.Mui-disabled):before': {
              borderBottom: 'none',
            },
            '&:after': {
              borderBottom: 'none',
            },
          },
          '& .MuiInput-input': {
            fontSize: '14px',
            padding: '2px 0',
            lineHeight: `${lineHeight}px`,
            backgroundColor: 'transparent',
            position: 'relative',
            zIndex: 2,
          },
          '& .Mui-disabled': {
            color: 'black !important',
            WebkitTextFillColor: 'black !important',
          },
        }}
        slotProps={{
          htmlInput: {
            disableUnderline: false,
            autoComplete: 'new-password',
            'data-form-type': 'other',
          },
        }}
      />
    </Box>
  );
}

function Page({ children, id }) {
  return (
    <Box
      id={id}
      component="div"
      sx={{
        width: '210mm',
        height: '297mm',
        padding: '20mm',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: '0px 1px 10px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
}

export default function PDFDoc({ data, onSubmit, viewOnly = false }) {
  const [formData, setFormData] = useState({
    nameOfConsumer: '',
    addressOfConsumer: '',
    leaseOrPurchase: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    customOptions: '',
    modificationFacility: '',
    automobilePurchasedFrom: '',
    priceOfVehicle: '',
    estimatedPrice: '',
    estimatedDeliveryDate: '',
    placeOfDelivery: '',
    consumerSignature: '',
    signatureDate: '',
  });

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState('');

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSignatureClick = (type) => {
    if (viewOnly) return;
    setCurrentSignatureType(type);
    setSignatureModalOpen(true);
  };

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSignatureSave = (signatureData) => {
    const signatureField = `${currentSignatureType}Signature`;
    setFormData((prev) => ({
      ...prev,
      [signatureField]: signatureData.signature,
    }));

    setSignatureModalOpen(false);
    setCurrentSignatureType('');
  };

  const saveDocument = () => {
    onSubmit && onSubmit(formData);
  };

  const underlineInputStyle = {
    '& .MuiInput-underline:before': {
      borderBottom: '1px solid black',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottom: '1px solid black',
    },
    '& .MuiInput-underline:after': {
      borderBottom: '1px solid black',
    },
    '& .MuiInput-input': {
      fontSize: '14px',
      padding: '2px 0',
    },

    '& .Mui-disabled': {
      color: 'black !important',
      WebkitTextFillColor: 'black !important',
    },
  };

  const multilineInputStyle = {
    '& .MuiInput-root': {
      '&:before': {
        borderBottom: 'none',
      },
      '&:hover:not(.Mui-disabled):before': {
        borderBottom: 'none',
      },
      '&:after': {
        borderBottom: 'none',
      },
    },
    '& .MuiInput-input': {
      fontSize: '14px',
      padding: '2px 0',
      lineHeight: '22px',
      backgroundColor: 'transparent',
    },
    '& .Mui-disabled': {
      color: 'black !important',
      WebkitTextFillColor: 'black !important',
    },
  };

  const pageContent = [
    {
      pageNumber: 1,
      content: (
        <Page id="page-1">
          <Box textAlign="center" mb={3}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: '20px',
                borderBottom: '2px solid black',
                display: 'inline-block',
                mb: 1,
              }}
            >
              VIP AUTO GROUP INC.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '14px' }}>
              1204 Hylan Boulevard
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '14px' }}>
              Staten Island, NY 10305
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mt: 1,
                borderBottom: '2px solid black',
                pb: 1,
              }}
            >
              Registered Automobile Broker Business Facility Identification
              Number 7124002 ABK
            </Typography>
          </Box>

          <Box mb={3}>
            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '140px' }}
              >
                Name of Consumer:
              </Typography>
              <TextField
                variant="standard"
                value={formData.nameOfConsumer}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('nameOfConsumer')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>
            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '140px' }}
              >
                Address of Consumer:
              </Typography>
              <TextField
                variant="standard"
                value={formData.addressOfConsumer}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('addressOfConsumer')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>
            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '140px' }}
              >
                Lease or Purchase:
              </Typography>
              <TextField
                variant="standard"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={viewOnly}
                value={formData.leaseOrPurchase}
                onChange={handleInputChange('leaseOrPurchase')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              sx={{ fontSize: '16px', mb: 2, textDecoration: 'underline' }}
            >
              Section 1 - Description of Automobile
            </Typography>

            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '60px' }}
              >
                Make:
              </Typography>
              <TextField
                variant="standard"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={viewOnly}
                value={formData.make}
                onChange={handleInputChange('make')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '60px' }}
              >
                Model:
              </Typography>
              <TextField
                variant="standard"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={viewOnly}
                value={formData.model}
                onChange={handleInputChange('model')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '60px' }}
              >
                Year:
              </Typography>
              <TextField
                variant="standard"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={viewOnly}
                value={formData.year}
                onChange={handleInputChange('year')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box mb={3} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '60px' }}
              >
                VIN:
              </Typography>
              <TextField
                variant="standard"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={viewOnly}
                value={formData.vin}
                onChange={handleInputChange('vin')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="body1" sx={{ fontSize: '14px', mb: 1 }}>
                Custom Options or Modifications and Further Description of
                Automobile (if applicable):
              </Typography>
              <LinedTextArea
                value={formData.customOptions}
                disabled={viewOnly}
                onChange={handleInputChange('customOptions')}
                rows={3}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="body1" sx={{ fontSize: '14px', mb: 1 }}>
                Name and Address of Modification Facility (if applicable):
              </Typography>
              <LinedTextArea
                value={formData.modificationFacility}
                disabled={viewOnly}
                onChange={handleInputChange('modificationFacility')}
                rows={3}
              />
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontSize: '14px', mb: 1 }}>
                Automobile Purchased From (list the name of the dealer along
                with fees, commissions, or other sums paid by dealer to VIP AUTO
                GROUP INC., for arranging the sale between the consumer and
                dealer):
              </Typography>
              <LinedTextArea
                value={formData.automobilePurchasedFrom}
                disabled={viewOnly}
                onChange={handleInputChange('automobilePurchasedFrom')}
                rows={3}
              />
            </Box>
          </Box>
        </Page>
      ),
    },
    {
      pageNumber: 2,
      content: (
        <Page id="page-2">
          <Box mb={3}>
            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 1, minWidth: '50px' }}
              >
                Price of Vehicle:
              </Typography>
              <TextField
                variant="standard"
                value={formData.priceOfVehicle}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('priceOfVehicle')}
                sx={{ ...underlineInputStyle, flexGrow: 1, mr: 2 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 1, minWidth: '50px' }}
              >
                or Estimated Price of Vehicle:
              </Typography>
              <TextField
                variant="standard"
                value={formData.estimatedPrice}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('estimatedPrice')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                px: 12,
                mb: 3,
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'justify',
                  hyphens: 'auto',
                  wordSpacing: '0.1em',
                }}
              >
                If estimated, the price listed is an estimated price only. If
                the final price exceeds the estimated price by more than five
                percent (5%), the consumer has a right to cancel the contract
                and to receive a full refund.
              </Typography>
            </Box>

            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '140px' }}
              >
                Estimated Delivery Date:
              </Typography>
              <TextField
                variant="standard"
                value={formData.estimatedDeliveryDate}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('estimatedDeliveryDate')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box mb={2} display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mr: 2, minWidth: '180px' }}
              >
                Place of Delivery (full address):
              </Typography>
              <TextField
                variant="standard"
                value={formData.placeOfDelivery}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('placeOfDelivery')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                px: 12,
                mb: 3,
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'justify',
                  hyphens: 'auto',
                  wordSpacing: '0.1em',
                }}
              >
                If the automobile has not been delivered in accordance with the
                contract within thirty (30) days following such estimated
                delivery date, the consumer has the right to cancel the contract
                and to receive a full refund, unless the consumer has been
                advised of the reason for such delay. Providing acknowledgement
                that he/she has the option to take delivery of the automobile at
                the selling or leasing dealership.
              </Typography>
            </Box>
          </Box>

          <Box mb={3}>
            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 2,
                textAlign: 'justify',
              }}
            >
              The Manufacturer's warranty accompanying the automobile is the
              same warranty as that furnished by the manufacturer to any person
              who purchased that make automobile from an authorized dealer
              located in the United States (<strong>YES/ NO</strong>):
            </Typography>

            <Box
              mb={3}
              sx={{
                alignItems: 'center',
                marginLeft: '50px',
                marginRight: '50px',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                textAlign="center"
                sx={{ fontSize: '16px', mb: 2, textDecoration: 'underline' }}
              >
                Disclosures
              </Typography>

              <Typography
                fontWeight="bold"
                variant="body2"
                sx={{
                  fontSize: '13px',
                  mb: 2,
                  textAlign: 'justify',
                  lineHeight: '1.4',
                  hyphens: 'auto',
                  wordSpacing: '0.1em',
                  paddingLeft: '20px',
                  textIndent: '-20px',
                }}
              >
                <strong>(1)</strong> The automobile that is the subject of this
                transaction is or will be manufactured in accordance with United
                States specifications and is or will be certified by the
                manufacturer as such. If the automobile is not manufactured in
                accordance with United States safety specifications, the
                consumer has retained VIP AUTO GROUP INC., to arrange for the
                modification of the automobile to meet such specifications. If
                the automobile has not been modified to meet United States
                safety and if identified, VIP AUTO GROUP INC., assumes full
                financial responsibility that the automobile will be properly
                modified to meet all United States safety and environmental
                specifications.
              </Typography>

              <Typography
                fontWeight="bold"
                variant="body2"
                sx={{
                  fontSize: '13px',
                  mb: 2,
                  textAlign: 'justify',
                  lineHeight: '1.4',
                  hyphens: 'auto',
                  wordSpacing: '0.1em',
                  paddingLeft: '20px',
                  textIndent: '-20px',
                }}
              >
                <strong>(2)</strong> If the consumer elects to cancel the
                contract as permitted herein, VIP AUTO GROUP INC., shall make a
                full refund to the consumer within ten (10) business days
                following the request for a refund.
              </Typography>

              <Typography
                fontWeight="bold"
                variant="body2"
                sx={{
                  fontSize: '13px',
                  mb: 2,
                  textAlign: 'justify',
                  lineHeight: '1.4',
                  hyphens: 'auto',
                  wordSpacing: '0.1em',
                  paddingLeft: '20px',
                  textIndent: '-20px',
                }}
              >
                <strong>(3)</strong> VIP AUTO GROUP INC., shall only accept
                payment for services from either the dealer selling or leasing
                the automobile or the buyer or lessee of the automobile, but may
                not accept payment from both.
              </Typography>
            </Box>
          </Box>
        </Page>
      ),
    },
    {
      pageNumber: 3,
      content: (
        <Page id="page-3">
          <Box mb={4}>
            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 2,
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              By signing below,{' '}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderBottom: '2px solid black',
                }}
              >
                {formData.nameOfConsumer}
              </span>{' '}
              acknowledges having read, understood, and agreed to the terms
              outlined in this Agreement.
            </Typography>

            <Box
              mt={8}
              mb={2}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', wordBreak: 'keep-all', width: '200px' }}
              >
                Consumer Signature:
              </Typography>
              <Box
                onClick={() => handleSignatureClick('consumer')}
                sx={{
                  width: '100%',
                  height: '20px',
                  cursor: viewOnly ? 'default' : 'pointer',
                  position: 'relative',
                  borderBottom: '1px solid black',
                }}
              >
                {formData.consumerSignature && (
                  <img
                    src={formData.consumerSignature}
                    alt="Consumer Signature"
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50px',
                      height: '25px',
                      maxWidth: '300px',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* VIP Auto Group Signature Line */}
            <Box
              mb={2}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', mb: 1, width: '300px' }}
              >
                VIP Auto Group Inc., Signature:
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: '20px',
                  position: 'relative',
                  mb: 1,
                  borderBottom: '1px solid black',
                }}
              >
                <img
                  src={ownerSignature}
                  alt="VIP Auto Group Inc. Signature"
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50px',
                    height: '30px',
                    maxWidth: '300px',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>

            {/* Date Line */}
            <Box mb={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '14px',
                  width: '50px',
                }}
              >
                Date:
              </Typography>
              <TextField
                variant="standard"
                value={formData.signatureDate}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('signatureDate')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
            </Box>

            {/* Signature Modal */}
            <SignatureModal
              open={signatureModalOpen}
              onClose={() => {
                setSignatureModalOpen(false);
                setCurrentSignatureType('');
              }}
              onSave={handleSignatureSave}
              title="Consumer's Signature"
            />
          </Box>
        </Page>
      ),
    },
    {
      pageNumber: 4,
      content: (
        <Page id="page-4">
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              sx={{ fontSize: '16px', mb: 3, textDecoration: 'underline' }}
            >
              Section 2 - Notice of Cancellation
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 2,
                textAlign: 'justify',
                lineHeight: '1.4',
              }}
            >
              You may cancel this contract, without any penalty or obligation,
              within three days from the date that a copy of an executed
              contract is received by you.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 2,
                textAlign: 'justify',
                lineHeight: '1.4',
              }}
            >
              To cancel this contract, mail or deliver a signed and dated copy
              of this cancellation notice, or any other written notice, to{' '}
              <strong>VIP AUTO GROUP INC.</strong>, at{' '}
              <strong>
                1204 Hyland Boulevard, Staten Island, New York 10305
              </strong>
              , not later than midnight of the third day following your receipt
              of a signed contract.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 6,
                mt: 6,
                textAlign: 'left',
                lineHeight: '1.4',
              }}
            >
              I hereby cancel this transaction.
            </Typography>

            <Box mb={4}>
              <Box
                onClick={() => handleSignatureClick('consumer')}
                sx={{
                  height: '20px',
                  maxWidth: '250px',
                  cursor: viewOnly ? 'default' : 'pointer',
                  position: 'relative',
                  borderBottom: '1px solid black',
                }}
              >
                {formData.consumerSignature && (
                  <img
                    src={formData.consumerSignature}
                    alt="Consumer Signature"
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50px',
                      height: '25px',
                      maxWidth: '300px',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', wordBreak: 'keep-all', width: '200px' }}
              >
                Signature of Consumer
              </Typography>
            </Box>

            <Box mb={4}>
              <TextField
                variant="standard"
                value={formData.signatureDate}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('signatureDate')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontSize: '14px',
                  width: '50px',
                }}
              >
                Date
              </Typography>
            </Box>
          </Box>
        </Page>
      ),
    },
    {
      pageNumber: 5,
      content: (
        <Page id="page-5">
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              sx={{ fontSize: '16px', mb: 3, textDecoration: 'underline' }}
            >
              Section 3 - Notice of Cancellation
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 2,
                textAlign: 'justify',
                lineHeight: '1.4',
              }}
            >
              You may cancel this contract, without any penalty or obligation,
              within three days from the date that a copy of an executed
              contract is received by you or until the automobile described in
              Section One of this contract has been delivered to you, whichever
              is sooner, provided that if the automobile is not delivered to you
              in accordance with this contract within thirty days of the
              estimated delivery date, you may cancel this contract and receive
              a full refund, unless the delay in delivery is attributable to
              you. Additionally, you may cancel this contract, without any
              penalty or obligation, for other grounds under New York State law,
              including but not limited to the rights enumerated in Section 738
              of the New York State General Business Law.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 2,
                textAlign: 'justify',
                lineHeight: '1.4',
              }}
            >
              To cancel this contract, mail or deliver a signed and dated copy
              of this cancellation notice, or any other written notice, to{' '}
              <strong>VIP AUTO GROUP INC.</strong>, at{' '}
              <strong>
                1204 Hyland Boulevard, Staten Island, New York 10305
              </strong>
              , within the applicable timeframe.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '14px',
                mb: 6,
                mt: 6,
                textAlign: 'left',
                lineHeight: '1.4',
              }}
            >
              I hereby cancel this transaction.
            </Typography>

            <Box mb={4}>
              <Box
                onClick={() => handleSignatureClick('consumer')}
                sx={{
                  height: '20px',
                  maxWidth: '250px',
                  cursor: viewOnly ? 'default' : 'pointer',
                  position: 'relative',
                  borderBottom: '1px solid black',
                }}
              >
                {formData.consumerSignature && (
                  <img
                    src={formData.consumerSignature}
                    alt="Consumer Signature"
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50px',
                      height: '25px',
                      maxWidth: '300px',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{ fontSize: '14px', wordBreak: 'keep-all', width: '200px' }}
              >
                Signature of Consumer
              </Typography>
            </Box>

            <Box mb={4}>
              <TextField
                variant="standard"
                value={formData.signatureDate}
                disabled={viewOnly}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={handleInputChange('signatureDate')}
                sx={{ ...underlineInputStyle, flexGrow: 1 }}
                slotProps={{
                  htmlInput: {
                    disableUnderline: false,
                    autoComplete: 'new-password',
                    'data-form-type': 'other',
                  },
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontSize: '14px',
                  width: '50px',
                }}
              >
                Date
              </Typography>
            </Box>
          </Box>
        </Page>
      ),
    },
  ];

  return (
    <Box sx={{ py: 2, minHeight: '100vh' }}>
      {pageContent.map((page) => (
        <Box
          key={page.pageNumber}
          sx={{
            borderRadius: '8px',
            backgroundColor: '#fff',
            margin: '0 auto',
            padding: '20px',
          }}
        >
          {page.content}
        </Box>
      ))}
      {!viewOnly && (
        <Box
          className=".no-print"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Button
            className=".no-print"
            variant="contained"
            color="primary"
            onClick={saveDocument}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
}
