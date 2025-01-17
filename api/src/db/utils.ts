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

import crypto from "crypto";
import { camelCase } from "lodash";
import config from "../config";

/**
 * Convert the keys of an object from snake notation to camel case
 *
 * @param {object} data An object (dictionary) to have its keys converted
 * @return The converted object
 */
export const transformKeysToCamelCase = (data) => {
  const obj = {};
  Object.keys(data).forEach((key) => {
    obj[camelCase(key)] = data[key];
  });

  return obj;
};

export const generateNamespacePrefix = (len: number = 6): string => {
  const getRandomPrefix = (requiredLength) =>
    config.get("api:prefix") +
    crypto
      .randomBytes(Math.ceil(requiredLength / 2))
      .toString("hex")
      .slice(0, len);
  let generatedNamespacePrefix = getRandomPrefix(len);
  do {
    generatedNamespacePrefix = getRandomPrefix(len);
    // Number() will return a number if it is a number, will return NaN it's not a number
    // Number.isNaN // returns true if NaN, otherwise false
  } while (!Number.isNaN(+Number(generatedNamespacePrefix.charAt(0))));
  // the reason we are doing this first Letter check is described in: https://app.zenhub.com/workspaces/platform-experience-5bb7c5ab4b5806bc2beb9d15/issues/bcgov/platform-services-registry/535
  // As discussed, this is a suitable solution in the shortterm however recommend when F5 roll out their update in early November that we remove this.
  return generatedNamespacePrefix;
};

/**
 * This function will need to call by filter function array.filter(compareContact)
 * @param otherArray the array that we want to get the difference with our origional array
 * @param comparator  The comparator is invoked with two arguments: (arrVal, othVal).
 * @returns the difference item of two array that exist in calling array but not in other Array
 */
export const comparerContact = (otherArray, comparator) => {
  return (current) => {
    return (
      otherArray.filter((other) => other[comparator] === current[comparator])
        .length === 0
    );
  };
};

/**
 *  This function will compare if value in array are all the same
 * @param quotaSizes is taking object like this
 * {quotaCpuSize: [ 'small', 'small', 'small', 'small' ],
 *   quotaMemorySize: [ 'small', 'small', 'small', 'small' ],
 *   quotaStorageSize: [ 'small', 'small', 'small', 'small' ]}
 * @returns true if all value in an array of the key are the same
 */
export const compareNameSpaceQuotaSize = (quotaSizes: any): boolean => {
  let isQuotaInEachNamespaceSame = false;
  for (const quotaType in quotaSizes) {
    if (quotaSizes[quotaType]) {
      isQuotaInEachNamespaceSame = quotaSizes[quotaType].every(
        (val, i, arr) => val === arr[0]
      );
      if (!isQuotaInEachNamespaceSame) return false;
    }
  }
  return isQuotaInEachNamespaceSame;
};
