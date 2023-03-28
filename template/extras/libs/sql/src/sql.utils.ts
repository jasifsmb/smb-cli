import { isArray, isObject } from 'class-validator';
import { operatorsAliases } from './sql.module';

export function convertWhere(where: any): any {
  try {
    if (typeof where !== 'object') return where;
    for (const key of Object.keys(where)) {
      if (Object.prototype.hasOwnProperty.call(where, key)) {
        const value = where[key];
        if (isArray(value)) {
          where[key] = value.map((x) => convertWhere(x));
        } else if (isObject(value)) {
          where[key] = convertWhere(value);
        }
        if (Object.prototype.hasOwnProperty.call(operatorsAliases, key)) {
          where[operatorsAliases[key]] = where[key];
          delete where[key];
        }
      }
    }
    return where;
  } catch (error) {
    return {};
  }
}

export function convertPopulate(populate: any): any {
  try {
    const _populate: any[] = [];
    for (let index = 0; index < populate.length; index++) {
      if (typeof populate[index] === 'string') {
        let association = populate[index];
        const isRequired = association.endsWith('*');
        const withDeleted = association.startsWith('+');
        const fetchSeparate =
          association.startsWith('+-') || association.startsWith('-');
        association = association.replace(/[*+-]/g, '');
        if (association.indexOf('.') > -1) {
          const associationArr = association.split('.');
          let parentInclude: any[] = _populate;
          for (let _index = 0; _index < associationArr.length - 1; _index++) {
            const _association = associationArr[_index];
            const parentAassociationIndex = parentInclude.findIndex(
              (x) => x.association === _association,
            );
            if (parentAassociationIndex > -1) {
              parentInclude[parentAassociationIndex].required =
                isRequired ||
                (parentInclude[parentAassociationIndex].required ?? undefined);
              parentInclude = parentInclude[parentAassociationIndex].include;
            } else {
              parentInclude.push({
                association: _association,
                include: [],
                required: isRequired || undefined,
              });
              parentInclude = parentInclude[parentInclude.length - 1].include;
            }
          }
          parentInclude.push({
            association: associationArr[associationArr.length - 1],
            include: [],
            required: isRequired || undefined,
            paranoid: withDeleted ? false : undefined,
            separate: fetchSeparate || undefined,
          });
        } else {
          _populate.push({
            association,
            include: [],
            required: isRequired || undefined,
            paranoid: withDeleted ? false : undefined,
            separate: fetchSeparate || undefined,
          });
        }
      }
    }
    return _populate;
  } catch (error) {
    return [];
  }
}
