import { ToolFormData, ValidationError } from '../types';

export class ValidationService {
  /**
   * 验证工具表单数据
   */
  static validateToolForm(data: Partial<ToolFormData>): ValidationError[] {
    const errors: ValidationError[] = [];

    // 验证名称
    if (!data.name || data.name.trim() === '') {
      errors.push({
        field: 'name',
        message: '工具名称不能为空',
        code: 'required'
      });
    } else if (data.name.length > 100) {
      errors.push({
        field: 'name',
        message: '工具名称不能超过100个字符',
        code: 'maxLength'
      });
    } else if (data.name.length < 1) {
      errors.push({
        field: 'name',
        message: '工具名称至少需要1个字符',
        code: 'minLength'
      });
    }

    // 验证描述
    if (data.description && data.description.length > 500) {
      errors.push({
        field: 'description',
        message: '工具描述不能超过500个字符',
        code: 'maxLength'
      });
    }

    // 验证类型
    if (!data.type) {
      errors.push({
        field: 'type',
        message: '请选择工具类型',
        code: 'required'
      });
    } else if (!['Function', 'Integration', 'Retrieval'].includes(data.type)) {
      errors.push({
        field: 'type',
        message: '无效的工具类型',
        code: 'invalid'
      });
    }

    return errors;
  }

  /**
   * 验证工具名称格式
   */
  static validateToolName(name: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!name || name.trim() === '') {
      errors.push({
        field: 'name',
        message: '工具名称不能为空',
        code: 'required'
      });
      return errors;
    }

    const trimmedName = name.trim();

    // 长度验证
    if (trimmedName.length < 1) {
      errors.push({
        field: 'name',
        message: '工具名称至少需要1个字符',
        code: 'minLength'
      });
    }

    if (trimmedName.length > 100) {
      errors.push({
        field: 'name',
        message: '工具名称不能超过100个字符',
        code: 'maxLength'
      });
    }

    // 字符验证 - 允许字母、数字、中文、空格、连字符、下划线
    const namePattern = /^[\w\s\u4e00-\u9fff-]+$/;
    if (!namePattern.test(trimmedName)) {
      errors.push({
        field: 'name',
        message: '工具名称只能包含字母、数字、中文、空格、连字符和下划线',
        code: 'invalidFormat'
      });
    }

    return errors;
  }

  /**
   * 验证工具描述
   */
  static validateToolDescription(description: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (description && description.length > 500) {
      errors.push({
        field: 'description',
        message: '工具描述不能超过500个字符',
        code: 'maxLength'
      });
    }

    return errors;
  }

  /**
   * 获取友好的错误消息
   */
  static getErrorMessage(error: ValidationError): string {
    const errorMessages: Record<string, string> = {
      required: '此字段为必填项',
      minLength: '输入内容太短',
      maxLength: '输入内容太长',
      invalid: '输入内容无效',
      invalidFormat: '输入格式不正确',
      unique: '此名称已被使用'
    };

    return errorMessages[error.code] || error.message;
  }

  /**
   * 检查是否有错误
   */
  static hasErrors(errors: ValidationError[]): boolean {
    return errors.length > 0;
  }

  /**
   * 获取特定字段的错误
   */
  static getFieldErrors(errors: ValidationError[], field: string): ValidationError[] {
    return errors.filter(error => error.field === field);
  }

  /**
   * 获取特定字段的第一个错误消息
   */
  static getFirstFieldError(errors: ValidationError[], field: string): string | null {
    const fieldErrors = this.getFieldErrors(errors, field);
    return fieldErrors.length > 0 ? this.getErrorMessage(fieldErrors[0]) : null;
  }
}

export default ValidationService;