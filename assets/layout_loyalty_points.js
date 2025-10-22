// import $ from 'jquery';

let loyaltyStatus = null;
let calculatedPoints = null;
let customerPoints = [];
let cashbackRule = {};
let redemptionMethods = {};
let selectedMethodStatus = false;

window.addEventListener("load", (event) => {

  showLoyaltyProgram();
  getRedemptionMethods();
  if (window.customerAuthState && window.customerAuthState.isAuthenticated) {
    getCustomerLoyaltyPoints()
  }

});

const showLoyaltyProgram = () => {
  $('body').append(`
        <div class="loyalty_button_footer" style="position: fixed; z-index: 999; display: inline-block; bottom: 50px; ${loyalty_button_direction === 'rtl' ?
      `left: 40px; right: unset;`
      : 'right: 40px; left: unset;'}">
    <style>

    .loyalty-points-rewards-list-logo.loyalty-points-rewards-popup-logo>path:first-child,
    .loyalty-points-rewards-list-logo.loyalty-points-rewards-popup-logo>path:nth-child(4),
    .loyalty-points-rewards-list-logo.loyalty-points-rewards-popup-logo>path:nth-child(3){
        fill: var(--text-color-primary-bg, #FFFFFF);
    }
    </style>
    <div style="
        display: flex;
        margin-top: 10px;
        color: white;
        width: fit-content;
        direction: ltr;
        background-color: transparent;
        width: 100%;">
        <div>
            <button onclick="popupLoyaltyReward()"
                    class="loyalty_footer_btn"
                    style="
              background-color: var(--primary-color, #cccccc);
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 8px;
              white-space: nowrap;
              border-radius: 25px;
              cursor: pointer;
              position: relative;
              color: var(--text-color-primary-bg, #FFFFFF);
              border:none;
              outline:none;
              width: auto;
              height: auto;
              transition: all 1s ease 1s;

        ">
                <svg class="loyalty-points-rewards-list-logo loyalty-points-rewards-popup-logo" width="30" height="30" viewBox="0 0 54 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M33.8577 1.84988C24.3527 1.84988 16.6328 9.57242 16.6328 19.0748C16.6328 22.5848 17.7128 25.8799 19.5479 28.6323C20.1428 28.5247 20.7355 28.4171 21.3304 28.4171H21.6004L24.3552 28.4719C21.9252 26.0419 20.4677 22.6945 20.4677 19.0219C20.4656 11.6769 26.4606 5.68449 33.8581 5.68449C41.2555 5.68449 47.1955 11.6796 47.1955 19.077C47.1955 22.7495 45.738 26.097 43.308 28.527L44.2255 28.257C44.7107 28.0946 45.2507 27.987 45.7907 27.987C46.6007 27.987 47.4107 28.2022 48.1658 28.5819C50.0009 25.8819 51.0809 22.5868 51.0809 19.0768C51.0851 9.57173 43.3076 1.84973 33.8576 1.84973L33.8577 1.84988Z" fill="#000000"/>
                                    <path d="M42.1751 17.5648C42.9302 16.8624 42.4999 15.62 41.5275 15.5124L37.2603 15.0251C36.9903 14.9703 36.7751 14.8627 36.6654 14.5927L34.883 10.7051C34.4505 9.78758 33.1554 9.78758 32.723 10.7051L30.9405 14.5927C30.8329 14.8079 30.6157 14.9703 30.3457 15.0251L26.1332 15.5103C25.1081 15.6179 24.7284 16.8603 25.4857 17.5627L28.6181 20.4252C28.7805 20.5876 28.8881 20.8576 28.8332 21.0727L27.9684 25.2303C27.7532 26.2554 28.8332 27.0127 29.7508 26.5254L33.476 24.4203C33.6911 24.3127 33.9611 24.3127 34.1784 24.4203L37.9035 26.5254C38.7684 27.0106 39.8484 26.2554 39.686 25.2303L38.8211 21.0727C38.7662 20.8027 38.8759 20.5876 39.0363 20.3703L42.1751 17.5648Z" fill="#F2CE73"/>
                                    <path d="M3.13245 45.4273C2.75487 45.9125 2.86245 46.6149 3.34761 46.9925L11.3925 52.9325C11.8777 53.31 12.5801 53.2025 12.905 52.7173L16.0901 48.3973L6.37226 41.1073L3.13245 45.4273Z" fill="#000000"/>
                                    <path d="M45.0898 30.7953L37.7998 33.1156V33.6008C37.6922 35.7059 36.2346 37.4884 34.1822 37.9757L33.697 38.0832C30.997 38.6781 28.297 39.0557 25.5419 39.1632L23.3271 39.2708C22.5719 39.3257 21.9771 38.7308 21.9222 38.0284C21.8674 37.2733 22.4622 36.6784 23.1646 36.6235L25.3795 36.516C27.9719 36.4084 30.5095 36.0835 33.047 35.4908L33.5321 35.3832C34.397 35.1681 35.0446 34.4108 35.0973 33.5481C35.0973 33.0081 34.9348 32.523 34.5573 32.0905C34.1797 31.713 33.6924 31.4957 33.1524 31.443L21.4349 31.1181C20.1398 31.0633 18.8974 31.4957 17.8174 32.253L8.31445 39.3259L18.3595 46.7784L28.187 47.6433C29.9146 47.8057 31.5894 47.2657 32.9394 46.2384L47.2494 34.8434C47.7894 34.4109 48.0594 33.8182 48.1143 33.1685C48.1691 32.5209 47.9519 31.8734 47.4667 31.3861C46.8171 30.7406 45.8995 30.5254 45.0895 30.7954L45.0898 30.7953Z" fill="#000000"/>
                                </svg>
                <span style="
              width: auto;
              opacity:  1;
              transition: all 1s ease 1s;
            ">${text_loyalty_rewards}</span>
            </button>
        </div>
    </div></div>
    `);
}

const getRedemptionMethods = () => {
  zid.cart.getRedemptionMethods(store_currency_code, { showErrorNotification: true }).then(function (response) {
    if (response && response.options) {
      redemptionMethods = response.options;
      if (redemptionMethods.length > 0) {

        redemptionMethods.forEach((redemptionMethod, index) => {
          if (redemptionMethod.is_active) {
            $(".loyalty-rewards-popup__rewards").append(`
                        <div class="loyalty-rewards-popup__rewards_row">
                            <svg class="loyalty-points-rewards-list-logo" width="30" height="30" viewBox="0 0 54 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M33.8577 1.84988C24.3527 1.84988 16.6328 9.57242 16.6328 19.0748C16.6328 22.5848 17.7128 25.8799 19.5479 28.6323C20.1428 28.5247 20.7355 28.4171 21.3304 28.4171H21.6004L24.3552 28.4719C21.9252 26.0419 20.4677 22.6945 20.4677 19.0219C20.4656 11.6769 26.4606 5.68449 33.8581 5.68449C41.2555 5.68449 47.1955 11.6796 47.1955 19.077C47.1955 22.7495 45.738 26.097 43.308 28.527L44.2255 28.257C44.7107 28.0946 45.2507 27.987 45.7907 27.987C46.6007 27.987 47.4107 28.2022 48.1658 28.5819C50.0009 25.8819 51.0809 22.5868 51.0809 19.0768C51.0851 9.57173 43.3076 1.84973 33.8576 1.84973L33.8577 1.84988Z" fill="#000000"/>
                                    <path d="M42.1751 17.5648C42.9302 16.8624 42.4999 15.62 41.5275 15.5124L37.2603 15.0251C36.9903 14.9703 36.7751 14.8627 36.6654 14.5927L34.883 10.7051C34.4505 9.78758 33.1554 9.78758 32.723 10.7051L30.9405 14.5927C30.8329 14.8079 30.6157 14.9703 30.3457 15.0251L26.1332 15.5103C25.1081 15.6179 24.7284 16.8603 25.4857 17.5627L28.6181 20.4252C28.7805 20.5876 28.8881 20.8576 28.8332 21.0727L27.9684 25.2303C27.7532 26.2554 28.8332 27.0127 29.7508 26.5254L33.476 24.4203C33.6911 24.3127 33.9611 24.3127 34.1784 24.4203L37.9035 26.5254C38.7684 27.0106 39.8484 26.2554 39.686 25.2303L38.8211 21.0727C38.7662 20.8027 38.8759 20.5876 39.0363 20.3703L42.1751 17.5648Z" fill="#F2CE73"/>
                                    <path d="M3.13245 45.4273C2.75487 45.9125 2.86245 46.6149 3.34761 46.9925L11.3925 52.9325C11.8777 53.31 12.5801 53.2025 12.905 52.7173L16.0901 48.3973L6.37226 41.1073L3.13245 45.4273Z" fill="#000000"/>
                                    <path d="M45.0898 30.7953L37.7998 33.1156V33.6008C37.6922 35.7059 36.2346 37.4884 34.1822 37.9757L33.697 38.0832C30.997 38.6781 28.297 39.0557 25.5419 39.1632L23.3271 39.2708C22.5719 39.3257 21.9771 38.7308 21.9222 38.0284C21.8674 37.2733 22.4622 36.6784 23.1646 36.6235L25.3795 36.516C27.9719 36.4084 30.5095 36.0835 33.047 35.4908L33.5321 35.3832C34.397 35.1681 35.0446 34.4108 35.0973 33.5481C35.0973 33.0081 34.9348 32.523 34.5573 32.0905C34.1797 31.713 33.6924 31.4957 33.1524 31.443L21.4349 31.1181C20.1398 31.0633 18.8974 31.4957 17.8174 32.253L8.31445 39.3259L18.3595 46.7784L28.187 47.6433C29.9146 47.8057 31.5894 47.2657 32.9394 46.2384L47.2494 34.8434C47.7894 34.4109 48.0594 33.8182 48.1143 33.1685C48.1691 32.5209 47.9519 31.8734 47.4667 31.3861C46.8171 30.7406 45.8995 30.5254 45.0895 30.7954L45.0898 30.7953Z" fill="#000000"/>
                                </svg>
                                <div> ${text_loyalty_options.replace('{points}', redemptionMethod.points_to_redeem).replace('{percentage}', redemptionMethod.reward.discount_value.toFixed(2)) + ' ' + store_currency_code}</div>
                        </div>
                     `);
          }
        });
      }
    }
  })

}

const getCustomerLoyaltyPoints = () => {
  zid.cart.getCustomerLoyaltyPoints({ showErrorNotification: true }).then(function (response) {
    if (response.status === "success" &&
      response.data &&
      response.data.points
    ) {
      customerPoints = response.data.points.available_poitns
      $('#customerPointsValue').html(customerPoints)
      $('.loyalty-points__info').removeClass('loyalty-points__info_d_none')
    }
  })
}

window.popupLoyaltyReward = () => {
  if ($('.loyalty-rewards-popup-init').length > 0) {
    insertLoyaltyRewardsWindow()
  } else {
    $('.loyalty-rewards-popup').removeClass('loyalty-rewards-popup-hidden');
  }
}

window.closeLoyaltyRewardsWindow = () => {
  $('.loyalty-rewards-popup').addClass('loyalty-rewards-popup-hidden')
}

const insertLoyaltyRewardsWindow = () => {
  var element = $('.loyalty-rewards-popup').detach();
  $('body').append(element);
  $('.loyalty-rewards-popup').removeClass('loyalty-rewards-popup-init');
  $('.loyalty-rewards-popup').removeClass('loyalty-rewards-popup-hidden');
}



