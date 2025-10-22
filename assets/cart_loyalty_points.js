let calculatedPoints = null;
let customerPoints = 0;
let cashbackRule = {};
let redemptionMethods = {};
let selectedMethodStatus = false;

window.addEventListener("load", (event) => {

  $('.loyalty-points-redemption-methods').on('change', (e) => {
    let value = $(e.currentTarget).val();
    if (value <= 0) {
      $('.loyalty-points-redemption-methods-submit').attr("disabled", "disabled");
    } else {
      $('.loyalty-points-redemption-methods-submit').removeAttr("disabled");
    }
  });

  if (loyaltyStatus) {
    showLoyaltyProgram();
    if (loyaltyCashbackStatus) {
      showLoyaltyCashBackProgram();
    }
    window.loyaltyCalculations = loyaltyCalculations;
    loyaltyCalculations(cart_total_value);
    if (window.customerAuthState && window.customerAuthState.isAuthenticated) {
      getCustomerLoyaltyPoints(getRedemptionMethods);
    }
  } else {
    hideLoyaltyProgram();
    window.loyaltyCalculations = null;
  }

});

const hideLoyaltyProgram = () => {
  $('.loyalty-points-section').addClass('loyalty-points-section-d-none');
}

const showLoyaltyProgram = () => {
  $('.loyalty-points-section').removeClass('loyalty-points-section-d-none');
}

const showLoyaltyCashBackProgram = () => {
  $('.loyalty-point-cashback-d-none').removeClass('loyalty-point-cashback-d-none');
}

const loyaltyCalculations = (total) => {
  zid.cart.getCalculatedPoints(total, { showErrorNotification: true }).then(function (response) {
    if (response &&
      response.points
    ) {
      calculatedPoints = response.points;
      if (calculatedPoints > 0) {
        $('#calculatedValue').html(calculatedPoints);
        $('#calculatedPoints').css("display", "block");
        $('#noCustomerCalculatedValue').html(calculatedPoints)
        $('#calculatedPoints').css("display", "block");
      } else {
        $('#calculatedPoints').css("display", "none");
        $('#noCustomerCalculatedPoints').css("display", "none");
      }
    }
  })
}

const getRedemptionMethods = () => {
  zid.cart.getRedemptionMethods(store_currency_code, { showErrorNotification: true }).then(function (response) {

    if (response &&
      response.options
    ) {
      redemptionMethods = response.options;
      if (redemptionMethods.length > 0) {
        redemptionMethods.forEach((redemptionMethod, index) => {
          if (redemptionMethod.is_active) {
            let att_dis = (redemptionMethod.points_to_redeem > customerPoints) ? 'disabled' : '';
            $(".loyalty-points-redemption-methods").append(`
                            <option ${att_dis} value="${redemptionMethod.id}" > ${text_loyalty_options.replace('{points}', redemptionMethod.points_to_redeem).replace('{percentage}', redemptionMethod.reward.discount_value.toFixed(2)) + ' ' + cart_currency_code}</option>
                        `);
          }
        });
      }
    }
  })
}

const getLoyaltyCashBackRules = () => {
  zidStore.loyalty.getLoyaltyCashBackRules().then(function (response) {

    if (response.status === "success" &&
      response.data &&
      response.data.point_cahsback_rules
    ) {
      cashbackRule = response.data.point_cahsback_rules.is_active;
      if (cashbackRule) {
        $('#cashbackRule').css("display", "flex");
      } else {
        $('#cashbackRule').css("display", "none");
      }
    }



  })
}

const getCustomerLoyaltyPoints = (onComplete) => {
  zid.cart.getCustomerLoyaltyPoints({ showErrorNotification: true }).then(function (response) {
    if (response &&
      response.balance !== undefined
    ) {
      customerPoints = response.balance;
      $('#customerPointsValue').html(customerPoints)
      if (onComplete) {
        onComplete()
      }
    }
  })
}


window.addRedemption = function (element) {

  if (!$('.loyalty-points-redemption-send-progress').hasClass('d-none'))
    return;

  let id = $(".loyalty-points-redemption-methods").val();
  let redemptionMethod = redemptionMethods.filter((dRedemptionMethod) => dRedemptionMethod.id === id);
  if (redemptionMethod.length <= 0) {
    toastr.error('redemptionMethod not found', null)
    $('.loyalty-points-redemption-send-progress').addClass('d-none');
    return;
  }

  $('.loyalty-points-redemption-send-progress').removeClass('d-none');
  zid.cart.addRedemptionMethod(redemptionMethod[0], { showErrorNotification: true }).then(function (response) {
    if (response.ok) {
      location.reload();
    } else {
      return response.json()
    }
  }).then(response => {
    if (response) {
      toastr.error(response.message.description, null);
      $('.loyalty-points-redemption-remove-progress').addClass('d-none');
    }
  })
}

window.removeRedemption = function (event) {

  if (!$('.loyalty-points-redemption-remove-progress').hasClass('d-none'))
    return;

  zid.cart.removeRedemptionMethod({ showErrorNotification: true }).then(function (response) {
    if (response.ok) {
      location.reload();
      return;
    } else {
      return response.json()
    }
  }).then(response => {
    if (response) {
      toastr.error(response.message.description, null);
      $('.loyalty-points-redemption-remove-progress').addClass('d-none');
    }
  })
}
