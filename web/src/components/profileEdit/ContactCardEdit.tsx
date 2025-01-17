//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Label } from '@rebass/forms';
import arrayMutators from 'final-form-arrays';
import React, { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';
import { createStructuredSelector } from 'reselect';
import {
  MAXIMUM_TECHNICAL_LEADS,
  MINIMUM_TECHNICAL_LEADS,
  PROFILE_EDIT_VIEW_NAMES,
  ROLES,
  ROUTE_PATHS,
} from '../../constants';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import { createNewTechnicalLeads } from '../../redux/githubID/githubID.action';
import { selectAllPersona } from '../../redux/githubID/githubID.selector';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { Button, SquareFormButton } from '../common/UI/Button';
import { EditSubmitButton } from '../common/UI/EditSubmitButton';
import FormTitle from '../common/UI/FormTitle';
import GithubUserValidation from '../common/UI/GithubUserValidation/GithubUserValidation';
import { ContactDetails } from './ContactCard';

interface IContactCardEditProps {
  profileId?: string;
  contactDetails: ContactDetails[];
  handleSubmitRefresh: any;
  isProvisioned?: boolean;
  hasPendingEdit: boolean;
  newTechnicalLeads: any;
  isDisabled: boolean;
  instance: IPublicClientApplication;
  accounts: AccountInfo[];
  graphToken: string;
  allPersona: any;
}

const ContactCardEdit: React.FC<IContactCardEditProps> = (props) => {
  const {
    profileId,
    contactDetails,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
    newTechnicalLeads,
    isDisabled,
    instance,
    accounts,
    graphToken,
    allPersona,
  } = props;

  const { setOpenBackdrop } = useCommonState();
  const api = useRegistryApi();

  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
  const [addingTL, setAddingTL] = useState<boolean>(false);

  const productOwner = contactDetails
    .filter((contact) => contact.roleId === ROLES.PRODUCT_OWNER)
    .pop();

  if (!productOwner) {
    throw new Error('Unable to get product owner details');
  }

  const existingTechnicalLeads = contactDetails.filter(
    (contact) => contact.roleId === ROLES.TECHNICAL_LEAD,
  );
  const onSubmit = async (formData: any) => {
    setOpenBackdrop(true);
    try {
      if (!profileId) {
        throw new Error('Unable to get profile id');
      }

      // 1. Prepare contact edit request body.
      formData.updatedProductOwner.firstName = POfirstName;
      formData.updatedProductOwner.lastName = POLastName;
      formData.updatedProductOwner.email = POEmail;
      formData.updatedProductOwner.githubId = POEmail;

      formData.updatedTechnicalLeads[0].firstName = tl1FirstName;
      formData.updatedTechnicalLeads[0].lastName = tl1LastName;
      formData.updatedTechnicalLeads[0].email = tl1Email;
      formData.updatedTechnicalLeads[0].githubId = tl1Email;

      if (formData.updatedTechnicalLeads.length === 2) {
        formData.updatedTechnicalLeads[1].firstName = tl2FirstName;
        formData.updatedTechnicalLeads[1].lastName = tl2LastName;
        formData.updatedTechnicalLeads[1].email = tl2Email;
        formData.updatedTechnicalLeads[1].githubId = tl2Email;
      }

      const { updatedProductOwner, updatedTechnicalLeads } = formData;
      const updatedContacts = [...updatedTechnicalLeads, updatedProductOwner];

      // 2. Request the profile contact edit.
      await api.updateContactsByProfileId(profileId, updatedContacts);

      // 3. All good? Redirect back to overview and tell the user.
      setGoBackToProfileEditable(true);
      handleSubmitRefresh();
      promptSuccessToastWithText('Your profile update was successful');
    } catch (err) {
      promptErrToastWithText(err.message);
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  /* Mapping Data from MS Graph API to fields */
  const [POfirstName, setPOFirstName] = useState<string>('');
  const [POLastName, setPOLastName] = useState<string>('');
  const [POEmail, setPOEmail] = useState<string>('');

  const [tl1FirstName, setTl1FirstName] = useState<string>('');
  const [tl1LastName, setTl1LastName] = useState<string>('');
  const [tl1Email, setTl1Email] = useState<string>('');

  const [tl2FirstName, setTl2FirstName] = useState<string>('');
  const [tl2LastName, setTl2LastName] = useState<string>('');
  const [tl2Email, setTl2Email] = useState<string>('');

  useEffect(() => {
    mapDispatchToProps({ allPersona });
    if (
      allPersona.productOwner[0] &&
      allPersona.productOwner[0].githubUser &&
      allPersona.productOwner[0].githubUser.value[0]
    ) {
      const prodOwner = allPersona.productOwner[0].githubUser.value[0];
      if (prodOwner) {
        setPOFirstName(prodOwner.givenName);
        setPOLastName(prodOwner.surname);
        setPOEmail(prodOwner.mail);
      }
    }
    if (allPersona.technicalLeads[0] && allPersona.technicalLeads[0].githubUser) {
      const tl1 = allPersona.technicalLeads[0].githubUser.value[0];
      if (tl1) {
        setTl1FirstName(tl1.givenName);
        setTl1LastName(tl1.surname);
        setTl1Email(tl1.mail);
      }
    }
    if (allPersona.technicalLeads[1] && allPersona.technicalLeads[1].githubUser) {
      const tl2 = allPersona.technicalLeads[1].githubUser.value[0];
      if (tl2) {
        setTl2FirstName(tl2.givenName);
        setTl2LastName(tl2.surname);
        setTl2Email(tl2.mail);
      }
    }
  }, [allPersona]);

  const TL_ROLE = {
    primary: 'Primary',
    secondary: 'Secondary',
  };

  const newTL = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    githubId: '',
    roleId: ROLES.TECHNICAL_LEAD,
  };

  if (goBackToProfileEditable && profileId) {
    return (
      <Redirect
        to={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
          ':viewName',
          PROFILE_EDIT_VIEW_NAMES.OVERVIEW,
        )}
      />
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      mutators={{
        ...arrayMutators,
      }}
      validate={(values) => {
        const errors: any = {};

        return errors;
      }}
    >
      {(formProps) => (
        <form onSubmit={formProps.handleSubmit}>
          <Flex flexDirection="column">
            <h4>Updating Exisitng Contacts to IDIR Accounts</h4>
            Please note that Product Owner and Technical Lead contacts that were added based on Git
            Identities must be updated to use IDIR identities. This is for security purposes.
            <br />
            To update a contact, begin by writing their IDIR associated email address in the
            corresponding search box. Their IDIR information will auto-fill.
          </Flex>
          <fieldset disabled={isDisabled} style={{ border: 0 }}>
            <FormTitle>Who is the product owner for this product?</FormTitle>
            <Field name="updatedProductOwner.id" initialValue={productOwner.id}>
              {({ input }) => <input type="hidden" {...input} id="id" />}
            </Field>
            <Flex flexDirection="column">
              <Label htmlFor="updatedProductOwner.githubId">Search by IDIR Email Address</Label>
              <GithubUserValidation
                name="updatedProductOwner.githubId"
                persona="productOwner"
                defaultValue=""
                initialValue={productOwner.email}
                position={0}
                instance={instance}
                accounts={accounts}
                graphToken={graphToken}
              />
            </Flex>
            <Field name="updatedProductOwner.roleId" initialValue={productOwner.roleId}>
              {({ input }) => <input type="hidden" {...input} id="roleId" />}
            </Field>
            <Flex flexDirection="column">
              <Label htmlFor="updatedProductOwner.firstName">First Name</Label>
              <Field<string>
                name="updatedProductOwner.firstName"
                defaultValue=""
                initialValue={productOwner.firstName}
              >
                {({ input }) => (
                  <input
                    type="text"
                    name="updatedProductOwner.firstName"
                    value={`${POfirstName}`}
                    readOnly={true}
                  />
                )}
              </Field>
            </Flex>
            <Flex flexDirection="column">
              <Label htmlFor="updatedProductOwner.lastName">Last Name</Label>
              <Field<string>
                name="updatedProductOwner.lastName"
                defaultValue=""
                initialValue={productOwner.lastName}
              >
                {({ input }) => (
                  <input
                    type="text"
                    name="updatedProductOwner.lastName"
                    value={`${POLastName}`}
                    readOnly={true}
                  />
                )}
              </Field>
            </Flex>
            <Flex flexDirection="column">
              <Label htmlFor="updatedProductOwner.email">Email Address</Label>
              <Field<string>
                name="updatedProductOwner.email"
                defaultValue=""
                initialValue={productOwner.email}
                sx={{ textTransform: 'none' }}
              >
                {({ input }) => (
                  <input
                    type="text"
                    name="updatedProductOwner.firstName"
                    value={`${POEmail}`}
                    readOnly={true}
                  />
                )}
              </Field>
            </Flex>

            <FormTitle>
              {existingTechnicalLeads.length > MINIMUM_TECHNICAL_LEADS
                ? 'Who are the technical leads for this product?'
                : 'Who is the technical lead for this product?'}
            </FormTitle>
            <FieldArray name="updatedTechnicalLeads" initialValue={existingTechnicalLeads}>
              {({ fields }) => {
                return fields.length && fields.length <= MAXIMUM_TECHNICAL_LEADS ? (
                  <>
                    {fields.map((name, index) => (
                      <div key={name}>
                        <Flex flexDirection="row">
                          <FormTitle style={{ fontSize: '20px' }}>
                            Technical Lead {index === 0 ? '(Primary)' : '(Secondary)'}
                          </FormTitle>
                          {/* TODO: (SB) implement the ability to delete contacts from edit page */}
                          {fields.length! > MINIMUM_TECHNICAL_LEADS && (
                            <Box my="auto" ml="auto" className="buttons">
                              <SquareFormButton
                                type="button"
                                onClick={() => fields.remove(index)}
                                style={{ cursor: 'pointer' }}
                                inversed
                              >
                                X
                              </SquareFormButton>
                            </Box>
                          )}
                        </Flex>
                        <Flex flexDirection="column">
                          <Label htmlFor={`${name}.githubId`}>Search by IDIR Email Address</Label>
                          <GithubUserValidation
                            name={`${name}.githubId`}
                            persona="technicalLeads"
                            position={index}
                            instance={instance}
                            accounts={accounts}
                            graphToken={graphToken}
                          />
                        </Flex>
                        <Flex flexDirection="column">
                          <Field name={`${name}.id`} initialValue={`${name}.id` || ''}>
                            {({ input }) => <input type="hidden" {...input} id={`${name}.id`} />}
                          </Field>
                          <Label htmlFor={`${name}.firstName`}>First Name</Label>
                          <Field<string> name={`${name}.firstName`} placeholder="Jane">
                            {({ input }) => (
                              <input
                                type="text"
                                name="updatedProductOwner.firstName"
                                value={index === 0 ? `${tl1FirstName}` : `${tl2FirstName}`}
                                readOnly={true}
                              />
                            )}
                          </Field>
                        </Flex>
                        <Flex flexDirection="column">
                          <Label htmlFor={`${name}.lastName`}>Last Name</Label>
                          <Field<string> name={`${name}.lastName`} placeholder="Doe">
                            {({ input }) => (
                              <input
                                type="text"
                                name="updatedProductOwner.firstName"
                                value={index === 0 ? `${tl1LastName}` : `${tl2LastName}`}
                                readOnly={true}
                              />
                            )}
                          </Field>
                        </Flex>
                        <Flex flexDirection="column">
                          <Label htmlFor={`${name}.email`}>Email Address</Label>
                          <Field<string>
                            name={`${name}.email`}
                            placeholder="jane.doe@example.com"
                            sx={{ textTransform: 'none' }}
                          >
                            {({ input }) => (
                              <input
                                type="text"
                                name="updatedProductOwner.firstName"
                                value={index === 0 ? `${tl1Email}` : `${tl2Email}`}
                                readOnly={true}
                              />
                            )}
                          </Field>
                        </Flex>
                      </div>
                    ))}
                    {fields.length && fields.length < MAXIMUM_TECHNICAL_LEADS && (
                      <Flex mt={3}>
                        <Button
                          type="button"
                          onClick={() => {
                            setAddingTL(!addingTL);
                          }}
                        >
                          Add Technical Lead
                        </Button>
                        {addingTL && (
                          <Flex flex="1 1 auto" justifyContent="flex-end" name="project.busOrgId">
                            <Button
                              type="button"
                              onClick={async () => {
                                // UNSHIFT has a open issue in react-final-form which makes it unaviliable
                                // fields.unshift(newTL);
                                const temp = fields.value[0];
                                fields.push(newTL);
                                fields.update(0, newTL);
                                fields.update(1, temp);
                                await newTechnicalLeads();
                              }}
                            >
                              {TL_ROLE.primary}
                            </Button>
                            <Button
                              type="button"
                              onClick={async () => {
                                fields.push(newTL);
                                await newTechnicalLeads();
                              }}
                            >
                              {TL_ROLE.secondary}
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    )}
                  </>
                ) : (
                  <Text as="h4" mt={2}>
                    Loading...
                  </Text>
                );
              }}
            </FieldArray>

            <EditSubmitButton
              hasPendingEdit={hasPendingEdit}
              isProvisioned={isProvisioned}
              pristine={formProps.pristine}
            />
          </fieldset>
        </form>
      )}
    </Form>
  );
};

// please DO NOT remove this mapStateToProps from this component as the react final form is using allPersona to do validation
const mapStateToProps = createStructuredSelector({
  allPersona: selectAllPersona,
});
const mapDispatchToProps = (dispatch: any) => ({
  newTechnicalLeads: () => dispatch(createNewTechnicalLeads()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContactCardEdit);
