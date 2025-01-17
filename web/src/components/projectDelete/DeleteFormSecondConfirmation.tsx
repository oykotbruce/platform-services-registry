import React from 'react';
import { Text, Box, Flex } from 'rebass';
import FormTitle from '../common/UI/FormTitle';
import { StyledFormButton } from '../common/UI/Button';

const DeleteFormSecondConfirmation: React.FC<any> = ({ licensePlate, nextPage, previousPage }) => {
  return (
    <>
      <FormTitle style={{ margin: 0, paddingBottom: '20px' }}>
        Deletion check for {licensePlate}
      </FormTitle>
      <Box mb={3}>
        <Text as="h3">To delete this product, you need to confirm:</Text>

        <Text mt="3" pl="3" as="li">
          All pods in all namespaces are scaled down.
        </Text>
        <Text mt="1" pl="3" as="li">
          All Presistent volum claim has been deleted.
        </Text>
        <Text mt="1" pl="3" as="li">
          All namespaces still exist (
          {`${licensePlate}-dev, ${licensePlate}-test, ${licensePlate}-tools, ${licensePlate}-prod`}
          ).
        </Text>
      </Box>
      <Flex flexDirection="row" justifyContent="space-between" mb="15px">
        <StyledFormButton smallButton onClick={previousPage}>
          Previous
        </StyledFormButton>
        <StyledFormButton
          smallButton
          onClick={nextPage}
          style={{ backgroundColor: '#d3d3d3', color: '#036' }}
        >
          Confirm
        </StyledFormButton>
      </Flex>
    </>
  );
};

export default DeleteFormSecondConfirmation;
