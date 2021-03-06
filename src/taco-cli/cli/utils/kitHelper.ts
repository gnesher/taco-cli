﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

/// <reference path="../../../typings/node.d.ts" />
/// <reference path="../../../typings/Q.d.ts" />
/// <reference path="../../../typings/tacoJsonMetadata.d.ts" />
/// <reference path="../../../typings/tacoJsonEditParams.d.ts" />

import Q = require ("q");
import path = require ("path");

import resources = require ("../../resources/resourceManager");
import TacoErrorCodes = require ("../tacoErrorCodes");
import errorHelper = require ("../tacoErrorHelper");
import tacoUtility = require ("taco-utils");
import TacoPackageLoader = tacoUtility.TacoPackageLoader;

import IKitHelper = TacoKits.IKitHelper;
import ITacoKits = TacoKits.ITacoKits;
import ITacoKitMetadata = TacoKits.ITacoKitMetadata;
import IKitInfo = TacoKits.IKitInfo;
import IPlatformOverrideMetadata = TacoKits.IPlatformOverrideMetadata;
import IPluginOverrideMetadata = TacoKits.IPluginOverrideMetadata;
import ITemplateOverrideInfo = TacoKits.ITemplateOverrideInfo;
import IKitTemplatesOverrideInfo = TacoKits.IKitTemplatesOverrideInfo;
import ProjectHelper = tacoUtility.ProjectHelper;

/**
 *  A helper class with methods to query the project root, project info like CLI/kit version etc.
 */
class KitHelper {
    // Keeping the cached promise acessible to tests
    public static kitPackagePromise: Q.Promise<ITacoKits> = null;

    private static dynamicDependenciesLocation: string = path.join(__dirname, "../../dynamicDependencies.json");
    private static TACO_KITS_NPM_PACKAGE_NAME: string = "taco-kits";

    public static getTemplatesForKit(kitId: string): Q.Promise<IKitTemplatesOverrideInfo> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<IKitTemplatesOverrideInfo> {
                return tacoKits.kitHelper.getTemplatesForKit(kitId);
            });
    }

    public static getKitMetadata(): Q.Promise<ITacoKitMetadata> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<ITacoKitMetadata> {
                return tacoKits.kitHelper.getKitMetadata();
            });
    }

    public static getKitInfo(kitId: string): Q.Promise<IKitInfo> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<IKitInfo> {
                return tacoKits.kitHelper.getKitInfo(kitId);
            });
    }

    public static getDefaultKit(): Q.Promise<string> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<string> {
                return tacoKits.kitHelper.getDefaultKit();
            });
    }

    public static getAllTemplates(): Q.Promise<ITemplateOverrideInfo[]> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<ITemplateOverrideInfo[]> {
                return tacoKits.kitHelper.getAllTemplates();
            });
    }

    public static getPlatformOverridesForKit(kitId: string): Q.Promise<IPlatformOverrideMetadata> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<IPlatformOverrideMetadata> {
                return tacoKits.kitHelper.getPlatformOverridesForKit(kitId);
            });
    }

    public static getPluginOverridesForKit(kitId: string): Q.Promise<IPluginOverrideMetadata> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<IPluginOverrideMetadata> {
                return tacoKits.kitHelper.getPluginOverridesForKit(kitId);
            });
    }

    public static getTemplateOverrideInfo(kitId: string, templateId: string): Q.Promise<ITemplateOverrideInfo> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<ITemplateOverrideInfo> {
                return tacoKits.kitHelper.getTemplateOverrideInfo(kitId, templateId);
            });
    }

    public static getValidCordovaCli(kitId: string): Q.Promise<string> {
        return KitHelper.acquireKitPackage()
            .then(function (tacoKits: ITacoKits): Q.Promise<string> {
                return tacoKits.kitHelper.getValidCordovaCli(kitId);
            });
    }

    public static editTacoJsonFile(editParams: ITacoJsonEditParams): Q.Promise<any> {
        var cordovaCliVersion: string;
        return Q({})
            .then(function() {
                if (editParams.isKitProject) {
                    return KitHelper.parseKitId(editParams.version)
                        .then(function(kitId: string): Q.Promise<any> {
                            editParams.version = kitId;
                            return KitHelper.getValidCordovaCli(kitId);
                        }).then(function(cordovaCli: string): void {
                            cordovaCliVersion = cordovaCli;
                        });
                };
            })
            .then(function() {
                return ProjectHelper.editTacoJsonFile(editParams, cordovaCliVersion);
            });
    }

    private static acquireKitPackage(): Q.Promise<ITacoKits> {
        if (!KitHelper.kitPackagePromise) {
            KitHelper.kitPackagePromise = TacoPackageLoader.lazyTacoRequire<ITacoKits>(KitHelper.TACO_KITS_NPM_PACKAGE_NAME,
                KitHelper.dynamicDependenciesLocation, tacoUtility.InstallLogLevel.error);
        }

        return KitHelper.kitPackagePromise;
    }

    private static parseKitId(versionValue: string): Q.Promise<string> {
        if (versionValue) {
            return Q.resolve(versionValue);
        }
        return KitHelper.getDefaultKit();
    }
}

export = KitHelper
