import { isArray, isObject } from 'class-validator';
import { Includeable, IncludeOptions } from 'sequelize';
import { getIncludeAttributes } from './sql.decorator';
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

export function convertPopulate(
  populate: any,
  populateAttributes: {
    association: string;
    attributes: string[];
  }[] = [],
): any {
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

        const attributeIndex = populateAttributes.findIndex(
          (x) => x.association === association,
        );
        let attributes: string[] | undefined = undefined;
        if (attributeIndex > -1) {
          attributes = populateAttributes[attributeIndex].attributes;
        }

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
                attributes,
                required: isRequired || undefined,
              });
              parentInclude = parentInclude[parentInclude.length - 1].include;
            }
          }
          parentInclude.push({
            association: associationArr[associationArr.length - 1],
            include: [],
            attributes,
            required: isRequired || undefined,
            paranoid: withDeleted ? false : undefined,
            separate: fetchSeparate || undefined,
          });
        } else {
          _populate.push({
            association,
            include: [],
            attributes,
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

export function setIncludeAttributes(
  _this: any,
  include: Includeable | Includeable[],
): Includeable[] {
  if (!Array.isArray(include)) {
    include = [include];
  }
  include.forEach((_include: IncludeOptions) => {
    const attributes = getIncludeAttributes(_this, _include.as);
    let _attributes = _include.attributes;
    if (Array.isArray(attributes) && Array.isArray(_attributes)) {
      _attributes = _attributes.filter((x: string) => attributes.includes(x));
      _include.attributes = _attributes;
    } else if (
      Array.isArray(_attributes) &&
      !Array.isArray(attributes) &&
      attributes.hasOwnProperty('exclude')
    ) {
      _attributes = _attributes.filter(
        (x: string) => !attributes.exclude.includes(x),
      );
      _include.attributes = _attributes;
    } else {
      _include.attributes = _attributes || attributes;
    }
    _include.include = _include.include
      ? setIncludeAttributes(_include.model, _include.include)
      : [];
  });
  return include;
}

export function populateSelect(selects: string[]): {
  attributes: string[];
  populateAttributes: {
    association: string;
    attributes: string[];
  }[];
} {
  const attributes: string[] = selects.filter(
    (select) => select.indexOf('.') === -1,
  );
  const otherPopulateAttributes: any = selects.filter(
    (select) => select.indexOf('.') > -1,
  );
  const populateAttributes: any = [];

  otherPopulateAttributes.forEach((select: string) => {
    const split = select.split('.');
    const attribute = split.pop();
    const key = split.join('.');
    const index = populateAttributes.findIndex(
      (x: { association: string }) => x.association === key,
    );
    if (index > -1) {
      populateAttributes[index].attributes = [
        ...populateAttributes[index].attributes,
        attribute,
      ].filter((x: any, i: any, a: string | any[]) => a.indexOf(x) === i);
    } else {
      populateAttributes.push({
        association: key,
        attributes: [attribute],
      });
    }
  });

  return { attributes, populateAttributes };
}
