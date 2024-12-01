'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const CouponCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountRule, setDiscountRule] = useState({
    quantity: '',
    discount: ''
  });
  const [reductionEnabled, setReductionEnabled] = useState(false);
  const [reductionRule, setReductionRule] = useState({
    quantity: '',
    reduction: ''
  });
  const [coupons, setCoupons] = useState([
    { threshold: '', discount: '', ratio: '0' },
    { threshold: '', discount: '', ratio: '0' }
  ]);

  const calculateCouponRatio = (threshold) => {
    const totalPrice = calculateTotalOriginalPrice();
    if (!threshold || threshold <= 0) return '0';
    
    if (totalPrice >= threshold) {
      return '1.0000';
    } else {
      return (totalPrice / threshold).toFixed(4);
    }
  };

  const updateAllCouponRatios = () => {
    const updatedCoupons = coupons.map(coupon => ({
      ...coupon,
      ratio: calculateCouponRatio(Number(coupon.threshold))
    }));
    setCoupons(updatedCoupons);
  };

  useEffect(() => {
    updateAllCouponRatios();
  }, [originalPrice, quantity]);

  const handleDiscountChange = (checked) => {
    setDiscountEnabled(checked);
    if (checked) {
      setReductionEnabled(false);
    }
  };

  const handleReductionChange = (checked) => {
    setReductionEnabled(checked);
    if (checked) {
      setDiscountEnabled(false);
    }
  };

  const calculateTotalOriginalPrice = () => {
    const price = Number(originalPrice) || 0;
    const qty = Number(quantity) || 0;
    return parseFloat((price * qty).toFixed(4));
  };

  const calculatePlusDiscount = (totalOrigPrice) => {
    if (!isPlusMember) return 0;
    return parseFloat((totalOrigPrice * 0.05).toFixed(4));
  };

  const calculateQuantityDiscount = (totalOrigPrice) => {
    if (!discountEnabled) return 0;
    const qty = Number(quantity) || 0;
    const discountQty = Number(discountRule.quantity) || 0;
    const discount = Number(discountRule.discount) || 0;
    
    if (qty >= discountQty) {
      return parseFloat((totalOrigPrice * 0.2).toFixed(4));
    }
    return 0;
  };

  const calculateReductionDiscount = (totalOrigPrice) => {
    if (!reductionEnabled) return 0;
    const qty = Number(quantity) || 0;
    const reductionQty = Number(reductionRule.quantity) || 0;
    const reduction = Number(reductionRule.reduction) || 0;
    
    if (qty >= reductionQty) {
      return parseFloat(reduction.toFixed(4));
    }
    return 0;
  };

  const calculateCouponDiscount = (totalOrigPrice) => {
    return parseFloat(coupons.reduce((sum, coupon) => {
      const threshold = Number(coupon.threshold) || 0;
      const discount = Number(coupon.discount) || 0;
      const ratio = Number(coupon.ratio) || 0;
      if (threshold === 0) return sum;
      
      return sum + parseFloat((discount * ratio).toFixed(4));
    }, 0).toFixed(4));
  };

  const calculateTotal = () => {
    const totalOrigPrice = calculateTotalOriginalPrice();
    const qty = Number(quantity) || 0;

    const plusDiscountAmount = calculatePlusDiscount(totalOrigPrice);
    const quantityDiscountAmount = calculateQuantityDiscount(totalOrigPrice);
    const reductionDiscountAmount = calculateReductionDiscount(totalOrigPrice);
    const couponDiscountAmount = calculateCouponDiscount(totalOrigPrice);

    const finalPrice = parseFloat((totalOrigPrice - plusDiscountAmount - quantityDiscountAmount - reductionDiscountAmount - couponDiscountAmount).toFixed(4));
    const unitPrice = qty > 0 ? parseFloat((finalPrice / qty).toFixed(4)) : 0;

    return {
      totalOriginalPrice: totalOrigPrice.toFixed(2),
      plusDiscountAmount: plusDiscountAmount.toFixed(2),
      quantityDiscountAmount: quantityDiscountAmount.toFixed(2),
      reductionDiscountAmount: reductionDiscountAmount.toFixed(2),
      couponDiscountAmount: couponDiscountAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      unitPrice: unitPrice.toFixed(2)
    };
  };

  const addCoupon = () => {
    setCoupons([...coupons, { threshold: '', discount: '', ratio: '0' }]);
  };

  const removeCoupon = (index) => {
    setCoupons(coupons.filter((_, i) => i !== index));
  };

  const updateCoupon = (index, field, value) => {
    const newCoupons = [...coupons];
    newCoupons[index] = { ...newCoupons[index], [field]: value };
    
    if (field === 'threshold') {
      newCoupons[index].ratio = calculateCouponRatio(Number(value));
    }
    
    setCoupons(newCoupons);
  };

  const { 
    totalOriginalPrice, 
    plusDiscountAmount,
    quantityDiscountAmount,
    reductionDiscountAmount,
    couponDiscountAmount,
    finalPrice,
    unitPrice 
  } = calculateTotal();

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-4">
        <h1 className="text-xl font-bold text-center mb-6 bg-orange-500 text-white py-3 rounded">
          东东凑单计算器
        </h1>

        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">商品原价:</label>
            <Input
              type="text"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full"
              placeholder="输入商品原价"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">数量:</label>
            <Input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full"
              placeholder="输入商品数量"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Plus会员95折:</label>
            <Checkbox
              checked={isPlusMember}
              onCheckedChange={setIsPlusMember}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">折扣:</label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    value={discountRule.quantity}
                    onChange={(e) => setDiscountRule(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="件数"
                    disabled={!discountEnabled}
                    className="text-sm"
                  />
                  <Input
                    type="text"
                    value={discountRule.discount}
                    onChange={(e) => setDiscountRule(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="折扣"
                    disabled={!discountEnabled}
                    className="text-sm"
                  />
                </div>
                <Checkbox
                  checked={discountEnabled}
                  onCheckedChange={handleDiscountChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    value={reductionRule.quantity}
                    onChange={(e) => setReductionRule(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="件数"
                    disabled={!reductionEnabled}
                    className="text-sm"
                  />
                  <Input
                    type="text"
                    value={reductionRule.reduction}
                    onChange={(e) => setReductionRule(prev => ({ ...prev, reduction: e.target.value }))}
                    placeholder="减额"
                    disabled={!reductionEnabled}
                    className="text-sm"
                  />
                </div>
                <Checkbox
                  checked={reductionEnabled}
                  onCheckedChange={handleReductionChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">优惠券:</label>
            {coupons.map((coupon, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="grid grid-cols-3 gap-1 flex-1">
                  <Input
                    type="text"
                    value={coupon.threshold}
                    onChange={(e) => updateCoupon(index, 'threshold', e.target.value)}
                    placeholder="满额"
                    className="text-sm"
                  />
                  <Input
                    type="text"
                    value={coupon.discount}
                    onChange={(e) => updateCoupon(index, 'discount', e.target.value)}
                    placeholder="优惠"
                    className="text-sm"
                  />
                  <Input
                    type="text"
                    value={coupon.ratio}
                    placeholder="比例"
                    readOnly
                    className="text-sm bg-gray-50"
                  />
                </div>
                <Button 
                  onClick={() => removeCoupon(index)}
                  variant="destructive"
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          <Button 
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white" 
            onClick={addCoupon}
          >
            添加优惠券
          </Button>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div>原价: ¥{originalPrice || '0'}</div>
            <div>{quantity || '0'}件共: ¥{totalOriginalPrice}</div>
            {isPlusMember && Number(plusDiscountAmount) > 0 && (
              <div>Plus优惠: -¥{plusDiscountAmount}</div>
            )}
            {discountEnabled && Number(quantityDiscountAmount) > 0 && (
              <div>折扣优惠: -¥{quantityDiscountAmount}</div>
            )}
            {reductionEnabled && Number(reductionDiscountAmount) > 0 && (
              <div>满减优惠: -¥{reductionDiscountAmount}</div>
            )}
            {Number(couponDiscountAmount) > 0 && (
              <div>优惠券优惠: -¥{couponDiscountAmount}</div>
            )}
            <div className="pt-2 border-t border-gray-200 font-medium">
              <div>最终价格: ¥{finalPrice}</div>
              <div>单均价: ¥{unitPrice}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponCalculator;
