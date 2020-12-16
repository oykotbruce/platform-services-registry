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

'use strict';

import { logger } from '@bcgov/common-nodejs-utils';
import DataManager from '../db';
import { Cluster } from '../db/model/cluster';
import { ClusterNamespace, ProjectNamespace } from '../db/model/namespace';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { NamespaceModel, ClusterModel } = dm;

export const isNamespaceSetProvisioned = async (namespaces: ProjectNamespace[], cluster: Cluster): Promise<boolean | Error> => {
  try {
    const promises: Promise<ClusterNamespace>[] = [];
    namespaces.forEach(namespace => {
      // @ts-ignore
      promises.push(NamespaceModel.findForNamespaceAndCluster(namespace.namespaceId, cluster.id));
    });
    const clusterNamespaces = await Promise.all(promises);

    // check provisioning status and filter only the all provisioned
    const flags: boolean[] = clusterNamespaces.map((clusterNamespace: ClusterNamespace): boolean => {
      return clusterNamespace.provisioned;
    });

    if (flags.every(f => f === true)) {
      return true;
    } else if (flags.every(f => f === false)) {
      return false;
    } else {
      throw new Error('Need to fix project namespace set');
    }
  } catch (err) {
    const message = `Unable to check if the namespace set is provisioned`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const getDefaultCluster = async (): Promise<Cluster | undefined> => {
  try {
    const clusters = await ClusterModel.findAll();
    return clusters.filter(c => c.isDefault === true).pop();
  } catch (err) {
    const message = 'Unable to get default cluster';
    logger.error(`${message}, err = ${err.message}`);
    return;
  }
};