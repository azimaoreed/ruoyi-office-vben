import type { VbenFormSchema } from '#/adapter/form';
import type { CarApi } from '#/api/oa/car/carinfo';



/** 新增/修改的表单 */
export function useFormSchema(formApi?: any): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'billCode',
      label: '单据编号',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'carId',
      label: '车辆',
      rules: 'required',
      component: 'CarSelectInput',
      componentProps: {
        placeholder: '请选择车辆',
        onChange: (value: number | string | undefined, car: CarApi.Car | undefined) => {
          debugger;
          console.log(value, car);
          // 如果需要设置其他字段，可以通过 formApi
          if (formApi && car?.carNo) {
            formApi.setFieldValue('carNo', car.carNo);
          }
        },
      },
    },

    {
      fieldName: 'goTime',
      label: '出车时间',
      rules: 'required',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
      },
    },
    {
      fieldName: 'returnTime',
      label: '回车时间',
      rules: 'required',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
      },
    },
    {
      fieldName: 'goArea',
      label: '出车地点',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入出车地点',
      },
    },
    {
      fieldName: 'returnArea',
      label: '回车地点',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入回车地点',
      },
    },
    {
      fieldName: 'passenger',
      label: '随行人',
      component: 'Input',
      formItemClass: 'col-span-full', // 添加这行
      componentProps: {
        placeholder: '请输入随行人',
      },
    },
    {
      fieldName: 'cause',
      label: '用车事由',
      rules: 'required',
      component: 'Textarea',
      formItemClass: 'col-span-full', // 添加这行
      componentProps: {
        placeholder: '请输入用车事由',
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      formItemClass: 'col-span-full', // 添加这行
      componentProps: {
        placeholder: '请输入备注',
      },
    }
  ];
}


