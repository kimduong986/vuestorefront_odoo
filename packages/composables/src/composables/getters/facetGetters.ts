/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FacetsGetters,
  AgnosticCategoryTree,
  AgnosticGroupedFacet,
  AgnosticPagination,
  AgnosticSort,
  AgnosticBreadcrumb,
  AgnosticFacet
} from '@vue-storefront/core';

const getAll = (searchData, criteria?: string[]): AgnosticFacet[] => [];

const isNumeric = (num) => !isNaN(num);

const getGrouped = (searchData, criteria?: string[]): AgnosticGroupedFacet[] => {

  if (!searchData?.data?.attributes) return [];

  const formatedAttribute = searchData?.data?.attributes.map(attribute => ({
    id: attribute.id,
    label: attribute.name,
    count: 0,
    options: attribute.values.map(value => ({
      id: value.search,
      value: value.id,
      label: value.name,
      metadata: value.search
    }))
  }));

  return formatedAttribute;
};

const getSortOptions = (searchData): AgnosticSort => ({
  options: [
    { id: 'list_price desc', value: 'list_price desc', attrName: 'Price: High to Low', type: '' },
    { id: 'list_price asc', value: 'list_price asc', attrName: 'Price: Low to High', type: '' },
    { id: 'name asc', value: 'name asc', attrName: 'Name: A to Z', type: '' },
    { id: 'name desc', value: 'name desc', attrName: 'Name: Z to A', type: '' }
  ],
  selected: searchData || 'name asc'
});

const getCategoryTree = (searchData): AgnosticCategoryTree => {
  if (!searchData.data) {
    return [] as any;
  }
  const categories = searchData.data.categories;

  const categoriesWithParents = categories.filter((item) => item.parent);
  const parents = categoriesWithParents.map((item) => item.parent).flat();
  const currentParentSelected = parents.find(item => item.slug === searchData.input.term);

  if (!currentParentSelected) {
    return [] as any;
  }

  const uniqueParents = categoriesWithParents.filter(item => {
    return item.parent[0].id === currentParentSelected.id;
  });

  uniqueParents.forEach(parent => {
    parent.childs = categoriesWithParents.filter(item => item.parent[0].id === parent.id);
  });

  return uniqueParents as any;
};

const getProducts = (searchData): any => {
  if (!searchData.data) {
    return {} as any;
  }

  const products = searchData.data.products;

  return products as any;
};

const getPagination = (searchData): AgnosticPagination => {
  const itemsPerPage = searchData.input?.ppg || 10;

  return {
    currentPage: 1,
    totalPages: Math.ceil(searchData.data?.totalProducts / itemsPerPage) || 1,
    totalItems: searchData.data?.totalProducts,
    itemsPerPage,
    pageOptions: [5, 10, 15, 20]
  };
};

const getBreadcrumbsByProduct = (product): AgnosticBreadcrumb[] => {
  const category = product.ecommerceCategories?.find(
    (cat) => cat.name !== 'All'
  );
  const breadcrumbs = [{ text: 'Home', link: '/' }];

  if (!category) {
    return [];
  }
  const topCategoryParentId = category.parent === null ? category.id : category.parent[0]?.parent[0]?.id;
  const splited = category.slug?.split('-');
  breadcrumbs.push({ text: splited[0], link: `/c/${splited[0]}/${topCategoryParentId}` });
  breadcrumbs.push({ text: splited[1], link: '' });

  return breadcrumbs || [];
};

const getBreadcrumbs = ({ input }): AgnosticBreadcrumb[] => {
  const breadcrumbs = [{ text: 'Home', link: '/' }];
  const categoryId = input.currentParentCategory?.parent ? input.currentParentCategory?.parent[0]?.id : input.params.slug_2;

  if (input.params.slug_1) {
    breadcrumbs.push({ text: input.params.slug_1, link: `/c/${input.params.slug_1}/${categoryId}` });
  }

  if (input.params.slug_2 && !isNumeric(input.params.slug_2)) {
    const splited = input.params.slug_2.split('-');
    breadcrumbs.push({ text: splited[2], link: '' });
  }

  return breadcrumbs;
};

const facetGetters: FacetsGetters<any, any> = {
  getBreadcrumbsByProduct,
  getSortOptions,
  getGrouped,
  getAll,
  getProducts,
  getCategoryTree,
  getBreadcrumbs,
  getPagination
};

export default facetGetters;
