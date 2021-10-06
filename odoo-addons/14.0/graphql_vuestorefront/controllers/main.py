# -*- coding: utf-8 -*-
# Copyright 2021 ODOOGAP/PROMPTEQUATION LDA
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import werkzeug
from odoo import http
from odoo.addons.graphql_base import GraphQLControllerMixin
from odoo.addons.payment.controllers.portal import PaymentProcessing
from odoo.addons.payment_adyen.controllers.main import AdyenController
from odoo.http import request

from ..schema import schema


class VSFAdyenController(AdyenController):

    @http.route(['/payment/adyen/return'], type='http', auth='public', csrf=False)
    def adyen_return(self, **post):
        # Confirm payment transaction
        super(VSFAdyenController, self).adyen_return(**post)

        tx_ids_list = request.session.get("__payment_tx_ids__", [])

        # Condition to verify if the Session have Transactions Associated
        if not tx_ids_list and post.get('merchantReference'):
            transaction_reference = post['merchantReference']

            payment_transaction = request.env['payment.transaction'].sudo().search([
                ('reference', 'like', str(transaction_reference))
            ])

            request.session["__payment_tx_ids__"] = [payment_transaction.id]

        # Confirm sale order
        PaymentProcessing().payment_status_poll()

        # Redirect to VSF
        vsf_payment_return_url = request.env['ir.config_parameter'].sudo().get_param('vsf_payment_return_url', '')

        # Clear the payment_tx_ids
        request.session["__payment_tx_ids__"] = []

        return werkzeug.utils.redirect(vsf_payment_return_url)


class GraphQLController(http.Controller, GraphQLControllerMixin):

    # The GraphiQL route, providing an IDE for developers
    @http.route("/graphiql/vsf", auth="user")
    def graphiql(self, **kwargs):
        return self._handle_graphiql_request(schema)

    # Optional monkey patch, needed to accept application/json GraphQL
    # requests. If you only need to accept GET requests or POST
    # with application/x-www-form-urlencoded content,
    # this is not necessary.
    GraphQLControllerMixin.patch_for_json("^/graphql/vsf/?$")

    # The graphql route, for applications.
    # Note csrf=False: you may want to apply extra security
    # (such as origin restrictions) to this route.
    @http.route("/graphql/vsf", auth="public", csrf=False)
    def graphql(self, **kwargs):
        return self._handle_graphql_request(schema)
