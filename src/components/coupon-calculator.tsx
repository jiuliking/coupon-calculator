'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Coupon {
  type: '满减' | '满折';
  condition: number;
  amount: number;
  ratio?: number;
}

export const CouponCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const calculateRatio = useCallback((coupon: Coupon) => {
    if (coupon.condition <= 0) return 0;
    return coupon.amount / coupon.condition;
  }, []);

  const calculateTotalPrice = useCallback((coupons: Coupon[]) => {
    let finalPrice = originalPrice;
    // 根据优惠券比例排序
    const sortedCoupons = [...coupons].sort((a, b) => (b.ratio || 0) - (a.ratio || 0));

    for (const coupon of sortedCoupons) {
      if (finalPrice >= (coupon.condition || 0)) {
        finalPrice -= coupon.amount || 0;
      }
    }

    return Math.max(0, finalPrice);
  }, [originalPrice]);

  const handleCouponChange = useCallback(
    (index: number, field: keyof Coupon, value: string | number) => {
      const newCoupons = [...coupons];
      newCoupons[index] = {
        ...newCoupons[index],
        [field]: value,
        ratio: calculateRatio(newCoupons[index]),
      };
      setCoupons(newCoupons);
    },
    [coupons, calculateRatio]
  );

  const handleAddCoupon = useCallback(() => {
    const newCoupon = {
      type: '满减' as const,
      condition: 0,
      amount: 0,
      ratio: 0,
    };
    setCoupons([...coupons, newCoupon]);
  }, [coupons]);

  const calculateFinalPrice = useCallback(() => {
    let finalPrice = originalPrice;
    if (isPlusMember) {
      finalPrice *= 0.95; // Plus会员95折
    }
    finalPrice = calculateTotalPrice(coupons);
    return finalPrice;
  }, [originalPrice, isPlusMember, coupons, calculateTotalPrice]);

  const calculateAveragePrice = useCallback(() => {
    const finalPrice = calculateFinalPrice();
    return quantity > 0 ? finalPrice / quantity : 0;
  }, [quantity, calculateFinalPrice]);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-4">
        <h1 className="text-xl font-bold text-center mb-6 bg-orange-500 text-white py-3 rounded">
          东东凑单计算器
        </h1>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">商品原价</label>
              <Input
                type="number"
                value={originalPrice || ''}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">商品数量</label>
              <Input
                type="number"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isPlusMember}
              onCheckedChange={(checked) => setIsPlusMember(!!checked)}
            />
            <label className="text-sm font-medium">Plus会员(95折)</label>
          </div>

          <div className="space-y-4">
            {coupons.map((coupon, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">优惠类型</label>
                    <select
                      value={coupon.type}
                      onChange={(e) =>
                        handleCouponChange(index, 'type', e.target.value as '满减' | '满折')
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="满减">满减</option>
                      <option value="满折">满折</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">条件</label>
                    <Input
                      type="number"
                      value={coupon.condition || ''}
                      onChange={(e) =>
                        handleCouponChange(index, 'condition', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {coupon.type === '满减' ? '优惠金额' : '折扣比例'}
                    </label>
                    <Input
                      type="number"
                      value={coupon.amount || ''}
                      onChange={(e) =>
                        handleCouponChange(index, 'amount', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={handleAddCoupon} className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white">
            添加优惠券
          </Button>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-semibold">最终价格: ¥{calculateFinalPrice().toFixed(2)}</p>
            <p className="text-sm text-gray-600">单均价: ¥{calculateAveragePrice().toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
