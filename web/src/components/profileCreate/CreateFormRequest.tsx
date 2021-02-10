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

import { Checkbox, Label } from '@rebass/forms';
import React, { useState } from 'react';
import { Text } from 'rebass';
import { StyledFormButton, StyledFormDisabledButton } from '../common/UI/Button';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';

const CreateFormRequest: React.FC = () => {
  const [boxChecked, setBoxChecked] = useState(false);
  return (
    <div>
      <FormTitle>All set?</FormTitle>
      <FormSubtitle>
        After hitting request, our smart robots will start working hard behind the scenes. 
        There is one step, the approval process, where a human is involved. 
        They'll take the opportunity, if needed, to reach out and have an on-boarding conversation with you. 
      </FormSubtitle>
      <FormSubtitle>
        Also, look out for our Notification emails that will provide you with valuable information regarding your project status and details.
      </FormSubtitle>
      <Label>
        <Checkbox
          type="checkbox"
          defaultChecked={boxChecked}
          onChange={() => {
            setBoxChecked(!boxChecked);
          }}
        />
        <Text px="20px">
          By checking this box, I confirm that I have read and understood the roles and
          responsibilities as described in the{' '}
          <a
            rel="noopener noreferrer"
            href="https://developer.gov.bc.ca/Welcome-to-our-Platform-Community!"
            target="_blank"
          >
            Onboarding Guide
          </a>
          .
        </Text>
      </Label>

      {/* @ts-ignore */}
      {boxChecked ? (
        <StyledFormButton>Request</StyledFormButton>
      ) : (
        <StyledFormDisabledButton>Request</StyledFormDisabledButton>
      )}
    </div>
  );
};

export default CreateFormRequest;
