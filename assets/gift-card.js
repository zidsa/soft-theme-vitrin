function editGiftCard() {
  window?.gift_dialog?.open();
}

function deleteGiftCard() {
  const deleteButton = $('.gift-card-delete-btn');
  const deleteIcon = deleteButton.find('.icon-trash-alt');
  const deleteProgress = deleteButton.find('.delete-gift-progress');

  // Prevent multiple clicks
  if (!deleteProgress.hasClass('d-none')) {
    return;
  }

  // Show loading state (following theme pattern)
  deleteIcon.addClass('d-none');
  deleteProgress.removeClass('d-none');

  window?.zid?.cart
    ?.removeGiftCard({ showErrorNotification: true })
    .then(() => {
      $('.cart-gift-card').hide();
      updateGiftButtonText(false);

      // Show success alert (following theme pattern)
      const translations = getTranslations();

      if (typeof toastr !== 'undefined') {
        toastr.success(translations.giftRemovedSuccess);
      }
    })
    .catch(() => {
      // Do nothing
    })
    .finally(() => {
      deleteIcon.removeClass('d-none');
      deleteProgress.addClass('d-none');
    });
}

function getTranslations() {
  // Get translations from existing gift card container or create defaults
  const existingContainer = $('.cart-gift-card').first();

  if (existingContainer.length > 0) {
    return {
      giftIconUrl: existingContainer.data('gift-icon') || '',
      giftTitle: existingContainer.data('gift-title') || '',
      fromLabel: existingContainer.data('from-label') || 'From',
      toLabel: existingContainer.data('to-label') || 'To',
      messageLabel: existingContainer.data('message-label') || 'Message',
      orderAddedAsGift:
        existingContainer.data('order-added') || 'The order has been added as a gift',
      sendAsGift: existingContainer.data('send-as-gift') || 'Send as a gift',
      giftRemovedSuccess:
        existingContainer.data('gift-removed-success') || 'Gift card removed successfully',
    };
  }

  // Fallback translations if no container exists
  return {
    giftIconUrl: '',
    giftTitle: 'The following products will be sent as a gift',
    fromLabel: 'From',
    toLabel: 'To',
    messageLabel: 'Message',
    orderAddedAsGift: 'The order has been added as a gift',
    sendAsGift: 'Send as a gift',
    giftRemovedSuccess: 'Gift card removed successfully',
  };
}

function getSpinnerUrl() {
  // Get spinner URL from existing spinner images in the page
  const existingSpinner = $('img[src*="spinner.gif"]').first();

  if (existingSpinner.length > 0) {
    return existingSpinner.attr('src');
  }

  // Fallback to a default path
  return '/assets/spinner.gif';
}

function updateGiftCardDisplay(giftData) {
  let giftCardContainer = $('.cart-gift-card');
  const translations = getTranslations();

  if (giftCardContainer.length === 0) {
    giftCardContainer = $(`
            <div class="cart-gift-card"
                 data-gift-icon="${translations.giftIconUrl}"
                 data-gift-title="${translations.giftTitle}"
                 data-from-label="${translations.fromLabel}"
                 data-to-label="${translations.toLabel}"
                 data-message-label="${translations.messageLabel}"
                 data-order-added="${translations.orderAddedAsGift}"
                 data-send-as-gift="${translations.sendAsGift}"
                 data-gift-removed-success="${translations.giftRemovedSuccess}">
              <div class="d-flex justify-content-between align-items-start mb-2">
                  <p class="font-weight-bold mb-0">
                      <img src="${translations.giftIconUrl}" style="display: inline-block" />
                      ${translations.giftTitle}
                  </p>
                  <div class="gift-card-actions">
                      <button type="button" class="btn btn-sm btn-outline-secondary gift-card-edit-btn" onclick="editGiftCard()" style="border-radius: 20px; padding: 5px 10px; margin-right: 5px;">
                          <span class="icon-file"></span>
                      </button>
                       <button type="button" class="btn btn-sm btn-outline-danger gift-card-delete-btn" onclick="deleteGiftCard()" style="border-radius: 20px; padding: 5px 10px;">
                           <span class="icon-trash-alt"></span>
                           <img class="delete-gift-progress d-none" src="${getSpinnerUrl()}" width="15" height="15"/>
                       </button>
                  </div>
              </div>
          </div>
      `);

    $('.template_for_cart_products_list').after(giftCardContainer);
  }

  // Remove existing content after the header div and add new content
  giftCardContainer.find('.d-flex').nextAll().remove();

  const detailsHtml = `
      <p class="mb-2">
          <span>${translations.fromLabel}: ${giftData.sender_name || ''}</span>
          <span class="mx-2">${translations.toLabel}: ${giftData.receiver_name || ''}</span>
      </p>
      ${
        giftData.gift_message && giftData.gift_message.length > 0
          ? `<p class="mb-0">
              <span>${translations.messageLabel}: </span> ${giftData.gift_message}
          </p>`
          : ''
      }
  `;

  giftCardContainer.find('.d-flex').after(detailsHtml);
  giftCardContainer.show();
  updateGiftButtonText(true);
}

function updateGiftButtonText(hasGift) {
  const giftButton = $('button[onclick="window.gift_dialog.open()"] span');
  const translations = getTranslations();

  if (giftButton.length > 0) {
    if (hasGift) {
      giftButton.text(translations.orderAddedAsGift);
    } else {
      giftButton.text(translations.sendAsGift);
    }
  }
}

// Event listener for gift submission
window.addEventListener('vitrin:gift:submitted', async event => {
  const cartData = event?.detail?.data;
  const giftData = cartData?.gift_card_details;

  if (giftData) {
    updateGiftCardDisplay(giftData);
  }
});
