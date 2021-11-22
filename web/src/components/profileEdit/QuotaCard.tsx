//
// Copyright © 2020 Province of British Columbia
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

import React from 'react';
import { Box, Flex, Text } from 'rebass';
import { Link as RouterLink } from 'react-router-dom';
import Aux from '../../hoc/auxillary';
import theme from '../../theme';
import { ProjectSetResourceQuotaSize, NamespaceQuotaOption, ProjectNamespaceResourceQuotaSize } from '../../types';
import { BaseIcon } from '../../components/common/UI/Icon';
import { faPen } from '@fortawesome/free-solid-svg-icons';

interface IQuotaCardProps {
  quotaDetails: QuotaDetails;
  href: string;
}

export interface QuotaDetails {
  licensePlate?: string;
  quotaSize: ProjectSetResourceQuotaSize;
  quotaOptions: {
    dev: NamespaceQuotaOption;
    test: NamespaceQuotaOption;
    tools: NamespaceQuotaOption;
    prod: NamespaceQuotaOption;
  };
}


interface SpecTextInterface {
  CPU: string;
  Memory: string;
  [key: string]: string;
}

export const NAMESPACE_DEFAULT_QUOTA: ProjectNamespaceResourceQuotaSize = {
  quotaCpuSize: '',
  quotaMemorySize: '',
  quotaStorageSize: '',
  quotaSnapshotSize: ''
}

const QuotaCard: React.FC<IQuotaCardProps> = (props) => {
  const {
    quotaDetails: {
      licensePlate = '',
      quotaSize = {
        dev: NAMESPACE_DEFAULT_QUOTA,
        test: NAMESPACE_DEFAULT_QUOTA,
        tools: NAMESPACE_DEFAULT_QUOTA,
        prod: NAMESPACE_DEFAULT_QUOTA
      },
    },
    href
  } = props;
  const namespaceTexts = [
    ['Production', 'prod'],
    ['Test', 'test'],
    ['Development', 'dev'],
    ['Tools', 'tools'],
  ];
  // const specTexts: SpecTextInterface = {
  //   CPU: quotaSize?.quotaCpuSize,
  //   Memory: quotaSize?.quotaMemorySize,
  //   Storage: quotaSize?.quotaStorageSize,
  //   Snapshot: quotaSize?.quotaSnapshotSize,
  // };
  return (
    <Flex flexWrap="wrap">
      {namespaceTexts.map((namespaceText: string[], index0: number) => {
        const index = namespaceText[1] as keyof typeof quotaSize
        return (
          <Aux key={index0}>
            <Box width={1 / 2} px={2} mt={3}>
              <Flex>
                <Text as="h3" marginX={2}>{namespaceText[0]} Namespace</Text>
                <RouterLink className="misc-class-m-dropdown-link" to={`${href}?namespace=${licensePlate}-${namespaceText[1]}`}>
                  <BaseIcon
                    name="edit"
                    color="primary"
                    hover
                    width={1.5}
                    height={1.5}
                    displayIcon={faPen}
                  />
                </RouterLink>
              </Flex>
              <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
                {`${licensePlate}-${namespaceText[1]} namespace`}
              </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                CPU:{quotaSize[index].quotaCpuSize}
              </Text>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                Memory:{quotaSize[index].quotaMemorySize}
              </Text>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                Storage:{quotaSize[index].quotaStorageSize}
              </Text>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                Snapshot:{quotaSize[index].quotaSnapshotSize}
              </Text>
            </Box>
          </Aux>
        )
      })
      }
    </Flex>
  );
};

export default QuotaCard;
