import {
  aws_sso as sso,
  IResource,
  Resource,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IPermissionSet } from './permissionset';
import { PrincipalProperty } from './principal';
import { validatePermissionSetArn } from './private/permissionset-common';
import { validatePrincipal } from './private/principal-common';

/**
 * The resource interface for an AWS SSO assignment.
 *
 * This interface has no attributes because the resulting resource has none.
 */
export interface IAssignment extends IResource {}

/**
 * The base assignment class
 *
 * Currently this is mostly empty. There isn't any
 * valuable methods to apply here or any resulting
 * attributes to define.
 */
abstract class AssignmentBase extends Resource implements IAssignment {};

/**
 * Attributes for an assignment of which there are none.
 */
export interface AssignmentAttributes {}

/**
 * The properties of a new assignment.
 */
export interface AssignmentProps {
  /**
   * The ARN of the AWS SSO instance
   */
  readonly ssoInstanceArn: string;

  /**
   * The permission set to assign to the principal
   */
  readonly permissionSet: IPermissionSet;

  /**
   * The principal to assign the permission set to
   */
  readonly principal: PrincipalProperty;

  /**
   * The target id the permission set will be assigned to
   */
  readonly targetId: string;
}

/**
 * The assignment construct.
 *
 * Has no import method because there is no attributes to import.
 */
export class Assignment extends AssignmentBase {
  private static validateTargetId(targetId: string) {
    if (!targetId.match(/\d{12}/)) {
      throw new Error(`targetId should be a 12 digit AWS account id, but was ${targetId}`);
    }
  }

  constructor(scope: Construct, id: string, props: AssignmentProps) {
    super (scope, id);

    Assignment.validateTargetId(props.targetId);
    validatePrincipal(props.principal);
    validatePermissionSetArn(props.permissionSet.permissionSetArn);

    new sso.CfnAssignment(this, 'assignment', {
      instanceArn: props.ssoInstanceArn,
      permissionSetArn: props.permissionSet.permissionSetArn,
      principalId: props.principal.principalId,
      principalType: props.principal.principalType,
      targetId: props.targetId,
      targetType: 'AWS_ACCOUNT',
    });
  }
}
