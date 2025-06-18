import React, { useState, useEffect } from 'react';
import {
  TextField,
  Checkbox,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import SignatureModal from './SignatureModal';

const OdometerAndDamageDisclosureForm = ({
  data = null,
  onSubmit,
  viewOnly = false,
}) => {
  const [vehicleYear, setVehicleYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [vin, setVin] = useState('');

  const [odometerReading, setOdometerReading] = useState('');
  const [odometerDigits, setOdometerDigits] = useState('');
  const [actualMileage, setActualMileage] = useState(false);
  const [exceedsMechanicalLimits, setExceedsMechanicalLimits] = useState(false);
  const [odometerDiscrepancy, setOdometerDiscrepancy] = useState(false);
  const [damageStatus, setDamageStatus] = useState('');
  const [sellerSignatureData, setSellerSignatureData] = useState(null);
  const [sellerName, setSellerName] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerCity, setSellerCity] = useState('');
  const [sellerState, setSellerState] = useState('');
  const [sellerZip, setSellerZip] = useState('');
  const [sellerDate, setSellerDate] = useState('');
  const [newOwnerSignatureData, setNewOwnerSignatureData] = useState(null);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newOwnerCity, setNewOwnerCity] = useState('');
  const [newOwnerState, setNewOwnerState] = useState('');
  const [newOwnerZip, setNewOwnerZip] = useState('');
  const [newOwnerDate, setNewOwnerDate] = useState('');

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState('');

  useEffect(() => {
    if (data) {
      if (data.vehicleInfo) {
        setVehicleYear(data.vehicleInfo.vehicleYear || '');
        setMake(data.vehicleInfo.make || '');
        setModel(data.vehicleInfo.model || '');
        setBodyType(data.vehicleInfo.bodyType || '');
        setVin(data.vehicleInfo.vin || '');
      }

      if (data.odometerInfo) {
        setOdometerReading(data.odometerInfo.odometerReading || '');
        setOdometerDigits(data.odometerInfo.odometerDigits || '');

        if (data.odometerInfo.certification) {
          setActualMileage(
            data.odometerInfo.certification.actualMileage || false
          );
          setExceedsMechanicalLimits(
            data.odometerInfo.certification.exceedsMechanicalLimits || false
          );
          setOdometerDiscrepancy(
            data.odometerInfo.certification.odometerDiscrepancy || false
          );
        }
      }

      if (data.damageDisclosure) {
        setDamageStatus(data.damageDisclosure.status || '');
      }

      if (data.seller) {
        setSellerSignatureData({
          signature: data.seller.signature,
          proofPhoto: data.seller.proofPhoto,
        });
        setSellerName(data.seller.name || '');

        if (data.seller.address) {
          setSellerAddress(data.seller.address.street || '');
          setSellerCity(data.seller.address.city || '');
          setSellerState(data.seller.address.state || '');
          setSellerZip(data.seller.address.zipCode || '');
        }

        if (data.seller.dateOfStatement) {
          setSellerDate(data.seller.dateOfStatement);
        }
      }

      if (data.newOwner) {
        setNewOwnerSignatureData({
          signature: data.newOwner.signature,
          proofPhoto: '',
        });
        setNewOwnerName(data.newOwner.name || '');

        if (data.newOwner.address) {
          setNewOwnerAddress(data.newOwner.address.street || '');
          setNewOwnerCity(data.newOwner.address.city || '');
          setNewOwnerState(data.newOwner.address.state || '');
          setNewOwnerZip(data.newOwner.address.zipCode || '');
        }

        if (data.newOwner.dateOfStatement) {
          setNewOwnerDate(data.newOwner.dateOfStatement);
        }
      }
    }
  }, [data]);

  const handleSignatureClick = (type) => {
    if (viewOnly) return;
    setCurrentSignatureType(type);
    setSignatureModalOpen(true);
  };

  const handleSignatureSave = (signatureData) => {
    if (currentSignatureType === 'seller') {
      setSellerSignatureData(signatureData);
    } else if (currentSignatureType === 'newOwner') {
      setNewOwnerSignatureData(signatureData);
    }
    setSignatureModalOpen(false);
    setCurrentSignatureType('');
  };

  const handleSubmit = () => {
    const formData = {
      vehicleInfo: {
        vehicleYear,
        make,
        model,
        bodyType,
        vin,
      },
      odometerInfo: {
        odometerReading,
        odometerDigits,
        certification: {
          actualMileage,
          exceedsMechanicalLimits,
          odometerDiscrepancy,
        },
      },
      damageDisclosure: {
        status: damageStatus,
      },
      seller: {
        signature: sellerSignatureData?.signature,
        proofPhoto: sellerSignatureData?.proofPhoto,
        name: sellerName,
        address: {
          street: sellerAddress,
          city: sellerCity,
          state: sellerState,
          zipCode: sellerZip,
        },
        dateOfStatement: sellerDate,
      },
      newOwner: {
        signature: newOwnerSignatureData?.signature,
        name: newOwnerName,
        address: {
          street: newOwnerAddress,
          city: newOwnerCity,
          state: newOwnerState,
          zipCode: newOwnerZip,
        },
        dateOfStatement: newOwnerDate,
      },
    };

    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log(formData);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        border: '2px solid #000',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ mr: 3 }}>
          <img
            src="data:image/png;base64,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"
            alt="NY State DMV Logo"
            style={{ height: '39px', width: '174px' }}
          />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: '12pt', fontWeight: 'bold' }}
          >
            ODOMETER AND DAMAGE DISCLOSURE STATEMENT
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'justify',
          fontSize: '8pt',
          lineHeight: 1.2,
          fontWeight: 'bold',
        }}
      >
        FEDERAL AND STATE LAWS REQUIRE THAT YOU PROVIDE THE MILEAGE AND
        CONDITION OF THE VEHICLE DESCRIBED BELOW WHEN TRANSFERRING OWNERSHIP OF
        IT TO SOMEONE ELSE. IF YOU DO NOT GIVE THE MILEAGE AND CONDITION
        INFORMATION TO THE NEW OWNER, OR IF YOU DO GIVE FALSE MILEAGE
        INFORMATION, YOU MAY BE SUBJECT TO FINES AND/OR IMPRISONMENT.
      </Typography>

      <Box
        sx={{
          border: '1px solid #000',
          bgcolor: '#f0f0f0',
          p: 0.1,
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '11pt', fontWeight: 'bold' }}>
          Odometer Disclosure Statement
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          fontSize: '9pt',
          fontStyle: 'italic',
        }}
      >
        <strong>
          Enter odometer reading exactly as it appears on the
          <br />
          vehicle's odometer (excluding tenths) and check applicable boxes.
        </strong>
      </Typography>

      <Box sx={{ display: 'flex', mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1,
            minWidth: '200px',
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: '8pt', fontWeight: 'bold', mb: 1 }}
          >
            ODOMETER READING
          </Typography>
          <Box sx={{ display: 'flex', border: '2px solid #000', mb: 1 }}>
            {[...Array(6)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: '25px',
                  height: '30px',
                  border: index < 5 ? '0 1px 0 0 solid #000' : 'none',
                  borderRight: index < 5 ? '1px solid #000' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14pt',
                  fontWeight: 'bold',
                }}
              >
                <TextField
                  value={odometerReading[index] || ''}
                  onChange={(e) => {
                    const newReading = odometerReading.split('');
                    newReading[index] = e.target.value.slice(-1);
                    setOdometerReading(newReading.join(''));
                  }}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '14pt',
                      fontWeight: 'bold',
                      padding: '0',
                      width: '20px',
                      height: '25px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                  inputProps={{ maxLength: 1 }}
                />
              </Box>
            ))}
          </Box>
          <Typography
            variant="body2"
            sx={{ fontSize: '8pt', fontWeight: 'bold' }}
          >
            (NO TENTHS)
          </Typography>
        </Box>

        <Box sx={{ p: 1, flexGrow: 1, border: '1px solid #000' }}>
          <Typography variant="body2" sx={{ mb: 1, fontSize: '9pt' }}>
            The vehicle described below is equipped with an odometer that{' '}
            <em>(please check one)</em>:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Checkbox
              size="small"
              checked={odometerDigits === 'five'}
              onChange={() =>
                setOdometerDigits(odometerDigits === 'five' ? '' : 'five')
              }
              disabled={viewOnly}
              sx={{
                p: 0,
                mr: 1,
                width: 16,
                height: 16,
                bgcolor: 'white',
                border: '1px solid black',
                color: 'transparent',
                borderRadius: 0,
              }}
              icon={<span style={{ width: 16, height: 16 }}></span>}
              checkedIcon={
                <span
                  style={{
                    width: 16,
                    height: 45,
                    fontSize: '25px',
                    fontWeight: 'bold',
                    color: 'black',
                    marginLeft: '5px',
                  }}
                >
                  ✔
                </span>
              }
            />
            <Typography variant="body2" sx={{ fontSize: '9pt' }}>
              has five digits, excluding tenths
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              size="small"
              checked={odometerDigits === 'six'}
              onChange={() =>
                setOdometerDigits(odometerDigits === 'six' ? '' : 'six')
              }
              disabled={viewOnly}
              sx={{
                p: 0,
                mr: 1,
                width: 16,
                height: 16,
                bgcolor: 'white',
                border: '1px solid black',
                color: 'transparent',
                borderRadius: 0,
              }}
              icon={<span style={{ width: 16, height: 16 }}></span>}
              checkedIcon={
                <span
                  style={{
                    width: 16,
                    height: 45,
                    fontSize: '25px',
                    fontWeight: 'bold',
                    color: 'black',
                    marginLeft: '5px',
                  }}
                >
                  ✔
                </span>
              }
            />
            <Typography variant="body2" sx={{ fontSize: '9pt' }}>
              has six digits, excluding tenths
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.1 }}>
          <Checkbox
            size="small"
            checked={actualMileage}
            onChange={(e) => setActualMileage(e.target.checked)}
            disabled={viewOnly}
            sx={{
              p: 0,
              mr: 1,
              width: 16,
              height: 16,
              bgcolor: 'white',
              border: '1px solid black',
              color: 'transparent',
              borderRadius: 0,
            }}
            icon={<span style={{ width: 16, height: 16 }}></span>}
            checkedIcon={
              <span
                style={{
                  width: 16,
                  height: 45,
                  fontSize: '25px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginLeft: '5px',
                }}
              >
                ✔
              </span>
            }
          />
          <Typography variant="body2" sx={{ fontSize: '9pt' }}>
            <strong>1.</strong> I certify that, to the best of my knowledge,
            this odometer reading reflects the ACTUAL MILEAGE as seen on the
            odometer of the vehicle described below.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.1 }}>
          <Checkbox
            size="small"
            checked={exceedsMechanicalLimits}
            onChange={(e) => setExceedsMechanicalLimits(e.target.checked)}
            disabled={viewOnly}
            sx={{
              p: 0,
              mr: 1,
              width: 16,
              height: 16,
              bgcolor: 'white',
              border: '1px solid black',
              color: 'transparent',
              borderRadius: 0,
            }}
            icon={<span style={{ width: 16, height: 16 }}></span>}
            checkedIcon={
              <span
                style={{
                  width: 16,
                  height: 45,
                  fontSize: '25px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginLeft: '5px',
                }}
              >
                ✔
              </span>
            }
          />
          <Typography variant="body2" sx={{ fontSize: '9pt' }}>
            <strong>2.</strong> I certify that, to the best of my knowledge,
            this odometer reading "EXCEEDS MECHANICAL LIMITS." (Odometer started
            over at zero)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox
            size="small"
            checked={odometerDiscrepancy}
            onChange={(e) => setOdometerDiscrepancy(e.target.checked)}
            disabled={viewOnly}
            sx={{
              p: 0,
              mr: 1,
              width: 16,
              height: 16,
              bgcolor: 'white',
              border: '1px solid black',
              color: 'transparent',
              borderRadius: 0,
            }}
            icon={<span style={{ width: 16, height: 16 }}></span>}
            checkedIcon={
              <span
                style={{
                  width: 16,
                  height: 45,
                  fontSize: '25px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginLeft: '5px',
                }}
              >
                ✔
              </span>
            }
          />
          <Typography variant="body2" sx={{ fontSize: '9pt' }}>
            <strong>3.</strong> I certify that, to the best of my knowledge,
            this odometer reading is "NOT THE ACTUAL MILEAGE. WARNING - ODOMETER
            DISCREPANCY."
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          border: '1px solid #000',
          bgcolor: '#f0f0f0',
          p: 0.1,
          mb: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '11pt', fontWeight: 'bold' }}>
          Damage Disclosure Statement - Check One Box
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{ mb: 0.1, fontSize: '8pt', fontWeight: 'bold' }}
      >
        Making a false statement or failing to accurately disclose the salvage
        status of a vehicle may subject you to substantial civil fines in
        addition to any penalties under the Penal Law.
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 1, fontSize: '9pt', fontWeight: 'bold' }}
      >
        I certify that, to the best of my knowledge, this vehicle{' '}
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', mx: 0.5 }}
        >
          <Checkbox
            size="small"
            checked={damageStatus === 'has_been'}
            onChange={() =>
              setDamageStatus(damageStatus === 'has_been' ? '' : 'has_been')
            }
            disabled={viewOnly}
            sx={{
              p: 0,
              mr: 1,
              width: 16,
              height: 16,
              bgcolor: 'white',
              border: '1px solid black',
              color: 'transparent',
              borderRadius: 0,
            }}
            icon={<span style={{ width: 16, height: 16 }}></span>}
            checkedIcon={
              <span
                style={{
                  width: 16,
                  height: 45,
                  fontSize: '25px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginLeft: '5px',
                }}
              >
                ✔
              </span>
            }
          />
        </Box>
        has been or{' '}
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', mx: 0.5 }}
        >
          <Checkbox
            size="small"
            checked={damageStatus === 'has_not_been'}
            onChange={() =>
              setDamageStatus(
                damageStatus === 'has_not_been' ? '' : 'has_not_been'
              )
            }
            disabled={viewOnly}
            sx={{
              p: 0,
              mr: 1,
              width: 16,
              height: 16,
              bgcolor: 'white',
              border: '1px solid black',
              color: 'transparent',
              borderRadius: 0,
            }}
            icon={<span style={{ width: 16, height: 16 }}></span>}
            checkedIcon={
              <span
                style={{
                  width: 16,
                  height: 45,
                  fontSize: '25px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginLeft: '5px',
                }}
              >
                ✔
              </span>
            }
          />
        </Box>
        has not been wrecked, destroyed or damaged to such an extent that the
        total estimate, or actual cost, of parts and labor to rebuild or
        reconstruct the vehicle to the condition it was in before a crash, and
        for legal operation on the road or highways, is more than 75% of the
        retail value of the vehicle at the time of loss. (Checking the "has
        been" box means that the vehicle must have an anti-theft examination
        before being registered and that the title issued will have the
        statement "Rebuilt Salvage: NY" on it.)
      </Typography>

      <TableContainer>
        <Table
          size="small"
          sx={{
            borderCollapse: 'collapse',
            borderBottom: 'none',
          }}
        >
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  p: 0.1,
                }}
              >
                Vehicle Year
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                Make
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                Model
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                Body Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                Vehicle Identification Number
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '30px',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  borderTop: 'none',
                  p: 0.1,
                  width: '50%',
                }}
              >
                Seller's Signature
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '50%',
                }}
              >
                Seller's Name (Print Name in Full)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '35px',
                }}
              >
                <Box
                  onClick={() => handleSignatureClick('seller')}
                  sx={{
                    width: '100%',
                    height: '100%',
                    cursor: viewOnly ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    backgroundColor: '#fafafa',
                    border: '1px dashed #ccc',
                    pointerEvents: viewOnly ? 'none' : 'auto',
                    '&:hover': {
                      backgroundColor: viewOnly ? '#fafafa' : '#f0f0f0',
                    },
                  }}
                >
                  {sellerSignatureData?.signature ? (
                    <img
                      src={sellerSignatureData?.signature}
                      alt="Seller Signature"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '9pt',
                        color: '#666',
                        fontStyle: 'italic',
                      }}
                    >
                      X
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  borderTop: 'none',
                  p: 0.1,
                }}
              >
                Mailing Address (Include Street Number and Name, Rural Delivery,
                Box, Apt. No.)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '30px',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  borderTop: 'none',
                  p: 0.1,
                  width: '40%',
                }}
              >
                City or Town
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '20%',
                }}
              >
                State
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '20%',
                }}
              >
                Zip Code
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '20%',
                }}
              >
                Date of Statement
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '30px',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={sellerCity}
                  onChange={(e) => setSellerCity(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={sellerState}
                  onChange={(e) => setSellerState(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={sellerZip}
                  onChange={(e) => setSellerZip(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  value={sellerDate}
                  onChange={(e) => setSellerDate(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  borderTop: 'none',
                  p: 0.1,
                  width: '50%',
                }}
              >
                New Owner's Signature
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '50%',
                }}
              >
                New Owner's Name (Print Name in Full)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '35px',
                }}
              >
                <Box
                  onClick={() => handleSignatureClick('newOwner')}
                  sx={{
                    width: '100%',
                    height: '100%',
                    cursor: viewOnly ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    backgroundColor: '#fafafa',
                    border: '1px dashed #ccc',
                    pointerEvents: viewOnly ? 'none' : 'auto',
                    '&:hover': {
                      backgroundColor: viewOnly ? '#fafafa' : '#f0f0f0',
                    },
                  }}
                >
                  {newOwnerSignatureData?.signature ? (
                    <img
                      src={newOwnerSignatureData.signature}
                      alt="New Owner Signature"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '9pt',
                        color: '#666',
                        fontStyle: 'italic',
                      }}
                    >
                      X
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  borderTop: 'none',
                  p: 0.1,
                }}
              >
                Mailing Address (Include Street Number and Name, Rural Delivery,
                Box, Apt. No.)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '30px',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer sx={{ mb: 1 }}>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  border: '1px solid #000',
                  borderTop: 'none',
                  p: 0.1,
                  width: '40%',
                }}
              >
                City or Town
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '20%',
                }}
              >
                State
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '20%',
                }}
              >
                Zip Code
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '8pt',
                  borderTop: 'none',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  width: '20%',
                }}
              >
                Date of Statement
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                  height: '30px',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={newOwnerCity}
                  onChange={(e) => setNewOwnerCity(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={newOwnerState}
                  onChange={(e) => setNewOwnerState(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={newOwnerZip}
                  onChange={(e) => setNewOwnerZip(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  p: 0.1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  value={newOwnerDate}
                  onChange={(e) => setNewOwnerDate(e.target.value)}
                  slotProps={{
                    input: { readOnly: viewOnly },
                  }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '9pt', p: 0.1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {!viewOnly && (
        <Box
          className="no-print"
          sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}
        >
          <Button
            className="no-print"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            size="large"
          >
            Submit Form
          </Button>
        </Box>
      )}

      <SignatureModal
        open={signatureModalOpen}
        onClose={() => {
          setSignatureModalOpen(false);
          setCurrentSignatureType('');
        }}
        onSave={handleSignatureSave}
        title={
          currentSignatureType === 'seller'
            ? "Seller's Signature"
            : "New Owner's Signature"
        }
      />
    </Paper>
  );
};

export default OdometerAndDamageDisclosureForm;
